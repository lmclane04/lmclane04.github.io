document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const commandInput = document.getElementById('command-input');
    const terminal = document.getElementById('terminal');
    let commandHistory = [];
    let historyIndex = -1;
    let topZIndex = 100;
    let tabCompletions = [];
    let tabIndex = -1;

    const matrixCanvas = document.getElementById('matrix-canvas');
    let isMatrixRunning = false;

    terminal.addEventListener('click', (e) => {
        if (e.target.classList.contains('clickable-file')) {
            const command = e.target.dataset.command;
            commandInput.value = command;
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            commandInput.dispatchEvent(enterEvent);
        } else if (!e.target.closest('.gui-window')) {
            commandInput.focus();
        }
    });

    commandInput.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') {
            tabCompletions = [];
            tabIndex = -1;
        }
        
        if (e.key === 'Enter') {
            const command = commandInput.value.trim();
            commandInput.value = '';
            historyIndex = -1; 

            if (command) {
                commandHistory.unshift(command); 
                if (commandHistory.length > 20) { 
                    commandHistory.pop();
                }
            }

            const commandEcho = document.createElement('div');
            commandEcho.innerHTML = `<span class="prompt">lauren@portfolio:~$</span>${command}`;
            output.appendChild(commandEcho);

            processCommand(command);

            terminal.scrollTop = terminal.scrollHeight;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                commandInput.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                commandInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = -1;
                commandInput.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const currentInput = commandInput.value;
            const words = currentInput.split(' ');
            const lastWord = words[words.length - 1];
            
            const availableCommands = ['help', 'list', 'cat', 'open', 'matrix', 'exit', 'clear'];
            const availableFiles = Object.keys(files);
            
            let matches = [];
            
            if (words.length > 1 && (words[0] === 'cat' || words[0] === 'open')) {
                matches = availableFiles.filter(file => 
                    file.toLowerCase().startsWith(lastWord.toLowerCase())
                );
            } else {
                const allOptions = [...availableCommands, ...availableFiles];
                matches = allOptions.filter(option => 
                    option.toLowerCase().startsWith(lastWord.toLowerCase())
                );
            }
            
            if (matches.length === 0 || lastWord === '') {
                return;
            }
            
            if (matches.length === 1) {
                words[words.length - 1] = matches[0];
                commandInput.value = words.join(' ');
                tabCompletions = [];
                tabIndex = -1;
            } else if (matches.length > 1) {
                if (tabCompletions.length === 0 || tabCompletions.join(' ') !== matches.join(' ')) {
                    tabCompletions = matches;
                    tabIndex = 0;
                } else {
                    tabIndex = (tabIndex + 1) % tabCompletions.length;
                }
                
                words[words.length - 1] = tabCompletions[tabIndex];
                commandInput.value = words.join(' ');
            }
        }
    });


    const files = {
        'about.txt': `Hello! I'm Lauren, a electrical engineering and computer science student at Stanford.
I'm passionate about building things, from low-level hardware to full-stack applications.
Type 'cat projects.txt' to see some of the things I've made.`,
        'projects.txt': `Here are some of the things I've built:

Hardware
-----------------------------
* Harmonic music player and display - Built a music player with harmonic, polyphonic, reverb, and stereo features on a PYNQ-Z1 FPGA board with a waveform VGA display.
* Password Hasher - Implemented the Brownie password hashing algorithm and checker on a PYNQ-Z1 board.
* LED Tetris - A fully functional game of Tetris on a custom PCB with an Arduino Uno and LED Multiplexing.
* Erratic Useless Box - A "Useless Box" FSM with added random behaviors programmed with an Arduino Uno.

Software
-----------------------------
Coming soon.`,
        'experience.txt': `Software Engineering Intern - MirrorTab
-----------------------------
Develop secure web browser and extension "Trusty" to protect users from man-in-the-browser attacks on financial services and healthcare sites. Develop Proof-of-Concept malicious browser extensions to stress test MirrorTab's WebRTC pixel streaming defense technology.

Investment Analyst Intern - Blue Pool Capital
-----------------------------
Performed company analysis and valuation for the investment team, with a focus on the Artificial Intelligence and Robotics industries.

Computer Science and Maths Tutor - Stanford Center for Teaching and Learning
-----------------------------
Tutor students in Stanford's core computer science subjects, including intro to programming, algorithms, computer systems, probability theory, and machine learning`,

        'research.txt': `Stanford AI Laboratory (2025)
-----------------------------
As part of Percy Leung & Dan Boneh’s research team, helped develop BountyBench, a benchmark for evaluating the cybersecurity capabilities and risks of large language models. Engineered offensive and defensive cybersecurity task environments using containerized (Kali Linux) infrastructure. Integrated real-world bug bounty data, enabling quantification of AI agent performance by economic impact (dollar value) and advancing the assessment of autonomous AI in cybersecurity. Findings submitted to NeurIPS 2025.

Stanford Brains in Silicon Lab (2024)
--------------------------------------
Developed tools for DynaDojo, an open-source benchmark for ML algorithms on complex dynamical systems. Led the integration of 130+ new chaotic dynamical systems into DynaDojo for benchmarking ML models. Devised linear algebra-based methods for generating testing data. Presented research findings for faculty weekly and also at the Stanford REU Conference in August.`,
        'extracurriculars.txt': `Stanford Space Initiative Satellite Team
---------------------------------------------------
Build and test hardware components for CubeSat satellite. Reflow soldering, wire crimping, harnessing, designing and debugging printed circuit boards.

The Blyth Fund
-----------------------------------------------------------
Analyze, value, and pitch public companies for Stanford's $270K student-run fund.

Stanford Varsity Fencing Team  (2023-24 Season)
-----------------------------------------------------------
Compete on D1 Collegiate circuit. Dedicate 16 hours a week to training while carying full undergraduate course load.
Previous Hong Kong U17 Women's Epee National Champion and Asia U17 Women's Epee Continental Champion.`,
        'languages.txt': `Fluent in Mandarin Chinese.
Programming Languages: C/C++, Python, Zsh, Bash, Verilog, HTML, JavaScript, TypeScript`,
        'coursework.txt': `Relevant Coursework
========================

* CS 107 Computer Organization and Systems: assembly, bitwise operations, memory management, implemented explicit free-list heap allocator with malloc, realloc, free
* CS 111 Operating Systems Principles: concurrency, synchronization, scheduling, processes, virtual memory, coded Unix v6 filesystem from scratch, built fully functional shell with pipelines and I/O redirection
* CS 221 Artificial Intelligence Principles and Techniques: search algorithms, Markov decision processes, reinforcement learning, constraint satisfaction
* CS 109 Probability for Computer Scientists: probability with ML applications, gradient ascent, maximum likelihood estimation, logistic regression, neural networks
* CS 106B Programming Abstractions: algorithms, data structures, object-oriented programming in C++
* CS 106A Programming Methodology: programming in Python
* CS 103 Mathematical Foundations of Computing: discrete math, computability theory, proofwriting
* DATASCI 112 Principles of Data Science: web-scraping, hyperparameter tuning, cross-validation, scikit-learn & pandas
* EE 108 Digital System Design: combinational and sequential CMOS logic design in Verilog, timing analysis
* ENGR 40M An Intro to Making: circuit design, bread-boarding, soldering
* MATH 51 Linear Algebra, Multivariable Calculus, and Modern Applications
* MATH 53 Differential Equations with Linear Algebra, Fourier Methods, and Modern Applications
* MATH 104 Applied Matrix Theory: applications include clustering, principal component analysis, dimensionality reduction, regression
* MATH 115 Functions of a Real Variable: elementary real analysis, proofwriting
* PHYSICS 41 Mechanics`,
        'socials.txt': `You can find me here:
- GitHub:   <a href="https://github.com/lmclane04" target="_blank" class="link">github.com/lmclane04</a>
- LinkedIn: <a href="https://www.linkedin.com/in/lauren-mclane-108256218/" target="_blank" class="link">https://www.linkedin.com/in/lauren-mclane-108256218/</a>
- Email:    <a href="mailto:lmclane@stanford.edu" class="link">lmclane@stanford.edu</a>`,
        '.secret.txt': `Well done, you've found the easter egg!`
    };

    function typeWriter(element, text, speed, callback) {
        let i = 0;
        element.innerHTML = '';
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else if (callback) {
                callback();
            }
        }
        type();
    }

    function bootSequence() {
        const welcomeMessage = `Hi, I'm Lauren! Welcome to my website.
This site is modeled after a command-line-interface. 
Type 'help' for a list of available commands.
To switch back to the non-interactive version, type 'exit'.`;
        const welcomeDiv = document.createElement('div');
        output.appendChild(welcomeDiv);
        typeWriter(welcomeDiv, welcomeMessage, 30, () => {
            commandInput.parentElement.style.opacity = 1;
            commandInput.focus();
        });
    }


    function processCommand(command) {
        const commandOutput = document.createElement('div');
        commandOutput.classList.add('command-output');

        const [cmd, ...args] = command.toLowerCase().split(' ').filter(Boolean);

        switch (cmd) {
            case 'help':
                commandOutput.innerHTML = `Available commands:
- help:    Shows this list of commands.
- list:    Lists files. Click on a file to view its content.
- cat:     Displays the content of a file in the terminal.
- open:    Opens a file in a new window. (e.g., 'open about.txt')
- matrix:  Toggles the digital rain background effect.
- exit:    Opens the graphical user interface version of this site.
- clear:   Clears the terminal screen.`;
                break;
            case 'list':
                let allFiles = Object.keys(files);
                if (args[0] !== '-a' && args[0] !== '-A') {
                    allFiles = allFiles.filter(file => !file.startsWith('.'));
                }
                const fileList = allFiles.map(file =>
                    `<a class="link clickable-file" data-command="open ${file}">${file}</a>`
                ).join('  ');
                commandOutput.innerHTML = fileList;
                break;
            case 'cat':
                if (args.length > 0) {
                    const filename = args[0];
                    if (files[filename]) {
                        commandOutput.innerHTML = files[filename];
                    } else {
                        commandOutput.textContent = `cat: ${filename}: No such file or directory`;
                    }
                } else {
                    commandOutput.textContent = 'cat: missing operand';
                }
                break;
            case 'open':
                 if (args.length > 0) {
                    const filename = args[0];
                    if (files[filename]) {
                        createWindow(filename, files[filename]);
                    } else {
                        commandOutput.textContent = `open: ${filename}: No such file or directory`;
                        output.appendChild(commandOutput);
                    }
                } else {
                    commandOutput.textContent = 'open: missing operand';
                    output.appendChild(commandOutput);
                }
                return;
            case 'matrix':
                if (isMatrixRunning) {
                    stopMatrix();
                } else {
                    runMatrix();
                }
                return;
            case 'exit':
                commandOutput.innerHTML = 'Opening graphical user interface...';
                window.location.href = 'index.html';
                break;
            case 'clear':
                output.innerHTML = '';
                return;
            case '':
                break;
            default:
                commandOutput.textContent = `command not found: ${command}. Type 'help' for a list of commands.`;
                break;
        }

        output.appendChild(commandOutput);
    }

    function createWindow(filename, content) {
        const guiWindow = document.createElement('div');
        guiWindow.className = 'gui-window';

        const randomOffsetX = Math.floor(Math.random() * 200) + 50;
        const randomOffsetY = Math.floor(Math.random() * 100) + 50;
        guiWindow.style.left = `${randomOffsetX}px`;
        guiWindow.style.top = `${randomOffsetY}px`;

        const titleBar = document.createElement('div');
        titleBar.className = 'gui-title-bar';

        const title = document.createElement('span');
        title.className = 'gui-title';
        title.textContent = `//text-file/${filename}`;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'gui-close-btn';
        closeBtn.innerHTML = '×';

        const contentArea = document.createElement('div');
        contentArea.className = 'gui-content';
        contentArea.innerHTML = content;

        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';

        titleBar.appendChild(title);
        titleBar.appendChild(closeBtn);
        guiWindow.appendChild(titleBar);
        guiWindow.appendChild(contentArea);
        guiWindow.appendChild(resizeHandle);
        document.body.appendChild(guiWindow);

        const bringToFront = () => {
            topZIndex++;
            guiWindow.style.zIndex = topZIndex;
        };

        guiWindow.addEventListener('mousedown', bringToFront);
        bringToFront();

        closeBtn.addEventListener('click', () => {
            guiWindow.remove();
        });

        let isDragging = false;
        let dragOffsetX, dragOffsetY;

        titleBar.addEventListener('mousedown', (e) => {
            if (e.target === titleBar || e.target === title) {
                isDragging = true;
                dragOffsetX = e.clientX - guiWindow.offsetLeft;
                dragOffsetY = e.clientY - guiWindow.offsetTop;
                e.preventDefault();
            }
        });

        let isResizing = false;
        let resizeStartX, resizeStartY, startWidth, startHeight;

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            resizeStartX = e.clientX;
            resizeStartY = e.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(guiWindow).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(guiWindow).height, 10);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                guiWindow.style.left = `${e.clientX - dragOffsetX}px`;
                guiWindow.style.top = `${e.clientY - dragOffsetY}px`;
            } else if (isResizing) {
                const newWidth = startWidth + (e.clientX - resizeStartX);
                const newHeight = startHeight + (e.clientY - resizeStartY);
                guiWindow.style.width = `${newWidth}px`;
                guiWindow.style.height = `${newHeight}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            isResizing = false;
        });
    }

    let matrixAnimation;
    
    function runMatrix() {
        isMatrixRunning = true;
        terminal.classList.add('matrix-mode');
        matrixCanvas.style.display = 'block';
        commandInput.focus();

        const matrixCtx = matrixCanvas.getContext('2d');
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;

        const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
        const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const alphabet = katakana + latin + nums;

        const fontSize = 16;
        const columns = matrixCanvas.width / fontSize;

        const rainDrops = [];
        for (let x = 0; x < columns; x++) {
            rainDrops[x] = 1;
        }

        const draw = () => {
            matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            matrixCtx.fillStyle = 'rgba(0, 255, 0, 0.2)';
            matrixCtx.font = fontSize + 'px monospace';

            for (let i = 0; i < rainDrops.length; i++) {
                const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                matrixCtx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

                if (rainDrops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
                    rainDrops[i] = 0;
                }
                rainDrops[i]++;
            }
        };

        matrixAnimation = setInterval(draw, 33);
    }

    function stopMatrix() {
        isMatrixRunning = false;
        terminal.classList.remove('matrix-mode');
        clearInterval(matrixAnimation);
        matrixCanvas.style.display = 'none';
    }

    commandInput.parentElement.style.opacity = 0;
    bootSequence();
});