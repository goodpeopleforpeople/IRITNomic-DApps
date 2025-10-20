// app.js - UI MANAGEMENT & WALLET INTEGRATION
class IritnomicDapp {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.contracts = {};
        this.manager = null;
        this.isConnected = false;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing IRITnomic DApp...');
            
            // Step-by-step initialization
            await this.loadWeb3();
            await this.loadContracts();
            this.initializeManager();
            this.loadEventListeners();
            
            // Auto-connect if wallet was previously connected
            if (this.isConnected && this.areContractsReady()) {
                await this.loadWalletData();
            }
            
            this.isInitialized = true;
            console.log('✅ DApp initialized successfully');
            this.showStatus('DApp ready - Connect your wallet to start', 'info');
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.showStatus('DApp initialization failed: ' + error.message, 'error');
        }
    }

    // ✅ Check if contracts are fully loaded and ready
    areContractsReady() {
        return this.contracts && 
               this.contracts.gasToken && 
               this.contracts.bgsToken && 
               this.contracts.staking;
    }

    async loadWeb3() {
        if (window.ethereum) {
            try {
                this.web3 = new Web3(window.ethereum);
                console.log('🔗 Web3 initialized');

                // Check current network
                const chainId = await this.web3.eth.getChainId();
                console.log('🌐 Current chain ID:', chainId);
                
                if (chainId !== 97) {
                    this.showStatus('Please switch to BSC Testnet (ChainId: 97)', 'error');
                    this.updateConnectionStatus(false);
                    return;
                }

                // Check existing accounts
                const accounts = await this.web3.eth.getAccounts();
                console.log('📱 Found accounts:', accounts);
                
                if (accounts.length > 0) {
                    this.account = accounts[0];
                    this.isConnected = true;
                    this.updateConnectionStatus(true);
                    console.log('✅ Auto-connected to account:', this.account);
                }

                // Setup event listeners
                this.setupEventListeners();

            } catch (error) {
                console.error('❌ Web3 initialization error:', error);
                this.showStatus('Failed to initialize Web3: ' + error.message, 'error');
            }
        } else {
            this.showStatus('Please install MetaMask or another Web3 wallet!', 'error');
        }
    }

    async loadContracts() {
        if (!this.web3) {
            throw new Error('Web3 not initialized');
        }

        try {
            console.log('📄 Loading contracts...');
            
            // Validate we have the required ABIs and addresses
            if (!GAS_ABI || !BGS_ABI || !STAKING_ABI) {
                throw new Error('Contract ABIs not found');
            }

            if (!CONTRACT_ADDRESSES.GAS_TOKEN || !CONTRACT_ADDRESSES.BGS_TOKEN || !CONTRACT_ADDRESSES.STAKING) {
                throw new Error('Contract addresses not defined');
            }

            // Initialize contract instances
            this.contracts = {
                gasToken: new this.web3.eth.Contract(GAS_ABI, CONTRACT_ADDRESSES.GAS_TOKEN),
                bgsToken: new this.web3.eth.Contract(BGS_ABI, CONTRACT_ADDRESSES.BGS_TOKEN),
                staking: new this.web3.eth.Contract(STAKING_ABI, CONTRACT_ADDRESSES.STAKING)
            };

            console.log('📝 Contract instances created');

            // Test contract connections with timeout
            await Promise.race([
                this.testContractConnections(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Contract connection timeout')), 10000)
                )
            ]);

            console.log('✅ All contracts loaded successfully');
            
        } catch (error) {
            console.error('❌ Contract loading failed:', error);
            throw new Error(`Failed to load contracts: ${error.message}`);
        }
    }

    async testContractConnections() {
        try {
            // Test basic contract calls
            const [gasSymbol, bgsSymbol, stakingGas] = await Promise.all([
                this.contracts.gasToken.methods.symbol().call(),
                this.contracts.bgsToken.methods.symbol().call(),
                this.contracts.staking.methods.GAS_TOKEN().call()
            ]);

            console.log('✅ GAS Token:', gasSymbol);
            console.log('✅ BGS Token:', bgsSymbol);
            console.log('✅ Staking GAS Address:', stakingGas);
            
        } catch (error) {
            console.error('❌ Contract connection test failed:', error);
            throw new Error(`Contract connection failed: ${error.message}`);
        }
    }

    initializeManager() {
        if (this.web3 && this.areContractsReady()) {
            this.manager = new IritnomicManager(this.web3, this.contracts, this.account);
            console.log('👨‍💼 Manager initialized');
        }
    }

    setupEventListeners() {
        window.ethereum.on('accountsChanged', (accounts) => {
            this.handleAccountsChanged(accounts);
        });

        window.ethereum.on('chainChanged', (chainId) => {
            this.handleChainChanged(chainId);
        });

        window.ethereum.on('disconnect', (error) => {
            console.log('🔴 Wallet disconnected:', error);
            this.handleWalletDisconnect();
        });
    }

    handleAccountsChanged(accounts) {
        console.log('🔄 Accounts changed:', accounts);
        this.account = accounts[0] || null;
        this.isConnected = !!this.account;
        this.updateConnectionStatus(this.isConnected);
        
        if (this.isConnected && this.areContractsReady()) {
            this.manager.account = this.account; // Update manager account
            this.loadWalletData();
        } else {
            this.resetUI();
        }
    }

    handleChainChanged(chainId) {
        console.log('🔄 Chain changed:', chainId);
        const newChainId = parseInt(chainId, 16);
        
        if (newChainId === 97) {
            this.showStatus('Connected to BSC Testnet', 'success');
            if (this.account && this.areContractsReady()) {
                this.loadWalletData();
            }
        } else {
            this.showStatus('Please switch to BSC Testnet (ChainId: 97)', 'error');
            this.updateConnectionStatus(false);
        }
    }

    handleWalletDisconnect() {
        console.log('🔴 Wallet disconnected');
        this.isConnected = false;
        this.account = null;
        this.updateConnectionStatus(false);
        this.resetUI();
    }

    loadEventListeners() {
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());
        document.getElementById('stakeBtn').addEventListener('click', () => this.handleStake());
        document.getElementById('withdrawRewardsBtn').addEventListener('click', () => this.handleWithdrawRewards());
        document.getElementById('burnGasBtn').addEventListener('click', () => this.handleBurnGas());
        document.getElementById('recycleBgsBtn').addEventListener('click', () => this.handleRecycleBgs());
        
        console.log('🎯 Event listeners loaded');
    }

    async connectWallet() {
        try {
            this.showStatus('Connecting wallet...', 'info');
            
            await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            const accounts = await this.web3.eth.getAccounts();
            this.account = accounts[0];
            this.isConnected = true;
            
            // Update manager with new account
            if (this.manager) {
                this.manager.account = this.account;
            }
            
            this.updateConnectionStatus(true);
            await this.loadWalletData();
            
            this.showStatus('Wallet connected successfully!', 'success');
            console.log('✅ Wallet connected:', this.account);
            
        } catch (error) {
            console.error('❌ Wallet connection error:', error);
            
            if (error.code === 4001) {
                this.showStatus('User denied wallet connection', 'error');
            } else {
                this.showStatus('Wallet connection failed: ' + error.message, 'error');
            }
        }
    }

    async loadWalletData() {
        if (!this.account || !this.areContractsReady() || !this.manager) {
            console.log('⏳ Skipping wallet data load - prerequisites not met');
            return;
        }

        try {
            console.log('📊 Loading wallet data...');
            const data = await this.manager.getWalletData();
            
            // Update UI with wallet data
            document.getElementById('gasBalance').textContent = this.formatNumber(data.balances.gas);
            document.getElementById('bgsBalance').textContent = this.formatNumber(data.balances.bgs);
            
            document.getElementById('userStake').textContent = this.formatNumber(data.staking.userStake) + ' GAS';
            document.getElementById('userShare').textContent = data.staking.userShare + '%';
            document.getElementById('totalStaked').textContent = this.formatNumber(data.staking.totalStaked) + ' GAS';
            document.getElementById('pendingRewards').textContent = this.formatNumber(data.staking.pendingRewards) + ' BGS';
            
            document.getElementById('apyBadge').textContent = 
                data.staking.currentAPY + '% APY • ' + data.staking.totalStakers + ' STAKERS';

            this.updateWalletInfo();
            console.log('✅ Wallet data loaded successfully');
            
        } catch (error) {
            console.error('❌ Error loading wallet data:', error);
            // Don't show error for "no stake" which is normal for new users
            if (!error.message.includes('User has no stake')) {
                this.showStatus('Failed to load wallet data: ' + error.message, 'error');
            }
        }
    }

    // 🎯 TRANSACTION HANDLERS
    async handleStake() {
        if (!this.validateReadyState()) return;

        const amount = document.getElementById('stakeAmount').value;
        if (!amount || amount <= 0) {
            this.showStatus('Please enter a valid amount', 'error');
            return;
        }

        try {
            this.showStatus('Processing stake transaction...', 'info');
            await this.manager.stake(amount);
            
            this.showStatus(`Successfully staked ${amount} GAS!`, 'success');
            await this.loadWalletData();
            document.getElementById('stakeAmount').value = '';

        } catch (error) {
            console.error('❌ Staking error:', error);
            this.showStatus('Staking failed: ' + this.manager.getUserFriendlyError(error), 'error');
        }
    }

    async handleWithdrawRewards() {
        if (!this.validateReadyState()) return;

        try {
            this.showStatus('Withdrawing rewards...', 'info');
            await this.manager.withdrawRewards();
            
            this.showStatus('Rewards withdrawn successfully!', 'success');
            await this.loadWalletData();

        } catch (error) {
            console.error('❌ Withdraw error:', error);
            this.showStatus('Withdraw failed: ' + this.manager.getUserFriendlyError(error), 'error');
        }
    }

    async handleBurnGas() {
        if (!this.validateReadyState()) return;

        const amount = document.getElementById('burnGasAmount').value;
        if (!amount || amount <= 0) {
            this.showStatus('Please enter a valid amount', 'error');
            return;
        }

        try {
            this.showStatus('Burning GAS tokens...', 'info');
            await this.manager.burnGas(amount);
            
            this.showStatus(`Burned ${amount} GAS successfully!`, 'success');
            await this.loadWalletData();
            document.getElementById('burnGasAmount').value = '';

        } catch (error) {
            console.error('❌ Burn error:', error);
            this.showStatus('Burn failed: ' + this.manager.getUserFriendlyError(error), 'error');
        }
    }

    async handleRecycleBgs() {
        if (!this.validateReadyState()) return;

        const amount = document.getElementById('recycleBgsAmount').value;
        if (!amount || amount <= 0) {
            this.showStatus('Please enter a valid amount', 'error');
            return;
        }

        try {
            this.showStatus('Recycling BGS to pool...', 'info');
            await this.manager.recycleBgs(amount);
            
            this.showStatus(`Recycled ${amount} BGS to pool!`, 'success');
            await this.loadWalletData();
            document.getElementById('recycleBgsAmount').value = '';

        } catch (error) {
            console.error('❌ Recycle error:', error);
            this.showStatus('Recycle failed: ' + this.manager.getUserFriendlyError(error), 'error');
        }
    }

    // ✅ VALIDATION FUNCTIONS
    validateReadyState() {
        if (!this.isConnected) {
            this.showStatus('Please connect your wallet first', 'error');
            return false;
        }
        
        if (!this.areContractsReady()) {
            this.showStatus('Contracts not ready. Please wait...', 'error');
            return false;
        }
        
        if (!this.manager) {
            this.showStatus('System not initialized. Please refresh page', 'error');
            return false;
        }
        
        return true;
    }

    // 🎨 UI MANAGEMENT FUNCTIONS
    updateConnectionStatus(connected) {
        const networkDot = document.getElementById('networkDot');
        const networkName = document.getElementById('networkName');
        const connectBtn = document.getElementById('connectWallet');
        const walletInfo = document.getElementById('walletInfo');

        if (connected) {
            networkDot.className = 'status-dot connected';
            networkName.textContent = 'BSC Testnet Connected';
            connectBtn.classList.add('hidden');
            walletInfo.classList.remove('hidden');
        } else {
            networkDot.className = 'status-dot';
            networkName.textContent = 'Disconnected';
            connectBtn.classList.remove('hidden');
            walletInfo.classList.add('hidden');
            this.resetUI();
        }
    }

    updateWalletInfo() {
        const walletInfo = document.getElementById('walletInfo');
        const connectBtn = document.getElementById('connectWallet');

        if (this.account) {
            connectBtn.classList.add('hidden');
            walletInfo.classList.remove('hidden');
            document.getElementById('walletAddress').textContent = 
                this.account.substring(0, 6) + '...' + this.account.substring(38);
        } else {
            connectBtn.classList.remove('hidden');
            walletInfo.classList.add('hidden');
        }
    }

    resetUI() {
        document.getElementById('userStake').textContent = '0 GAS';
        document.getElementById('userShare').textContent = '0%';
        document.getElementById('totalStaked').textContent = '0 GAS';
        document.getElementById('pendingRewards').textContent = '0 BGS';
        document.getElementById('gasBalance').textContent = '0';
        document.getElementById('bgsBalance').textContent = '0';
        document.getElementById('stakeAmount').value = '';
        document.getElementById('burnGasAmount').value = '';
        document.getElementById('recycleBgsAmount').value = '';
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2
        }).format(num);
    }

    showStatus(message, type = 'info') {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
        status.classList.remove('hidden');
        
        console.log(`📢 Status (${type}):`, message);
        
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                status.classList.add('hidden');
            }, 5000);
        }
    }
}

// Initialize app when page loads
window.addEventListener('load', () => {
    console.log('🖥️ Page loaded, initializing DApp...');
    window.iritnomicDapp = new IritnomicDapp();
});
