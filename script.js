// Reward configuration with percentages
const REWARDS = [
    { name: 'Coin x10', percentage: 40, icon: '🪙', color: '#f093fb', description: 'Kamu mendapatkan 10 Coin!' },
    { name: 'Coin x50', percentage: 30, icon: '💰', color: '#4facfe', description: 'Kamu mendapatkan 50 Coin!' },
    { name: 'Skin Biasa', percentage: 15, icon: '🎨', color: '#43e97b', description: 'Kamu mendapatkan Skin Biasa!' },
    { name: 'Skin Langka', percentage: 10, icon: '✨', color: '#fa709a', description: 'Kamu mendapatkan Skin Langka!' },
    { name: 'Skin Epic', percentage: 5, icon: '👑', color: '#30cfd0', description: 'Kamu mendapatkan Skin Epic!' }
];

// Game state
let isSpinning = false;
let totalSpins = 0;

// DOM elements
const wheel = document.getElementById('wheel');
const spinButton = document.getElementById('spinButton');
const resultModal = document.getElementById('resultModal');
const closeModal = document.getElementById('closeModal');
const spinAgain = document.getElementById('spinAgain');
const rewardIcon = document.getElementById('rewardIcon');
const rewardTitle = document.getElementById('rewardTitle');
const rewardDescription = document.getElementById('rewardDescription');
const totalSpinsEl = document.getElementById('totalSpins');
const lastRewardEl = document.getElementById('lastReward');

// RNG function based on percentage
function getRandomReward() {
    const random = Math.random() * 100;
    let cumulativePercentage = 0;
    
    for (const reward of REWARDS) {
        cumulativePercentage += reward.percentage;
        if (random <= cumulativePercentage) {
            return reward;
        }
    }
    
    return REWARDS[0]; // Fallback
}

// Calculate rotation angle for each reward
function getRotationForReward(rewardIndex) {
    // Each segment is 72 degrees (360/5)
    const segmentAngle = 72;
    // Base rotation for each segment (centered)
    const baseRotation = rewardIndex * segmentAngle + (segmentAngle / 2);
    // Add random variation within the segment
    const variation = (Math.random() - 0.5) * 40; // ±20 degrees variation
    return baseRotation + variation;
}

// Play spin sound (optional - using Web Audio API)
function playSpinSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 200;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('Audio not supported');
    }
}

// Play win sound
function playWinSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 523.25; // C5
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        // Second note
        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 659.25; // E5
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            osc2.start(audioContext.currentTime);
            osc2.stop(audioContext.currentTime + 0.3);
        }, 150);
    } catch (error) {
        console.log('Audio not supported');
    }
}

// Spin the wheel
function spinWheel() {
    if (isSpinning) return;
    
    isSpinning = true;
    spinButton.disabled = true;
    
    // Play spin sound
    playSpinSound();
    
    // Get random reward
    const reward = getRandomReward();
    const rewardIndex = REWARDS.indexOf(reward);
    
    // Calculate rotation
    const baseRotation = 360 * 5; // 5 full rotations
    const targetRotation = getRotationForReward(rewardIndex);
    const totalRotation = baseRotation + targetRotation;
    
    // Apply rotation
    wheel.style.transform = `rotate(${totalRotation}deg)`;
    wheel.classList.add('spinning');
    
    // After animation completes (3 seconds)
    setTimeout(() => {
        isSpinning = false;
        spinButton.disabled = false;
        wheel.classList.remove('spinning');
        
        // Update statistics
        totalSpins++;
        totalSpinsEl.textContent = totalSpins;
        lastRewardEl.textContent = reward.name;
        
        // Play win sound
        playWinSound();
        
        // Show result modal
        showResultModal(reward);
    }, 3000);
}

// Show result modal
function showResultModal(reward) {
    rewardIcon.textContent = reward.icon;
    rewardTitle.textContent = reward.name;
    rewardDescription.textContent = reward.description;
    resultModal.classList.add('show');
}

// Close modal
function closeResultModal() {
    resultModal.classList.remove('show');
}

// Event listeners
spinButton.addEventListener('click', spinWheel);
closeModal.addEventListener('click', closeResultModal);
spinAgain.addEventListener('click', () => {
    closeResultModal();
    setTimeout(() => {
        spinWheel();
    }, 300);
});

// Close modal when clicking outside
resultModal.addEventListener('click', (e) => {
    if (e.target === resultModal) {
        closeResultModal();
    }
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        if (!isSpinning && !resultModal.classList.contains('show')) {
            e.preventDefault();
            spinWheel();
        }
    }
    if (e.key === 'Escape') {
        if (resultModal.classList.contains('show')) {
            closeResultModal();
        }
    }
});

// Initialize
console.log('Spin Wheel RNG initialized!');
console.log('Rewards:', REWARDS);