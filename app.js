// Training Tracker Application
// Initialize Firebase
let db = null;
let auth = null;
let currentUser = null;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    alert('Firebase configuration error. Please check your Firebase credentials.');
}

// Storage wrapper using Firebase Firestore
const Storage = {
    async get(key) {
        if (!db) {
            console.error('Firebase not initialized');
            return null;
        }

        try {
            const userId = auth.currentUser?.uid || 'anonymous';
            const doc = await db.collection('users').doc(userId).collection('data').doc(key).get();

            if (doc.exists) {
                return doc.data().value;
            }
            return null;
        } catch (error) {
            console.error(`Error getting ${key}:`, error);
            return null;
        }
    },

    async set(key, value) {
        if (!db) {
            console.error('Firebase not initialized');
            return false;
        }

        try {
            const userId = auth.currentUser?.uid || 'anonymous';
            await db.collection('users').doc(userId).collection('data').doc(key).set({
                value: value,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    },

    async list(prefix) {
        if (!db) {
            console.error('Firebase not initialized');
            return [];
        }

        try {
            const userId = auth.currentUser?.uid || 'anonymous';
            const snapshot = await db.collection('users').doc(userId).collection('data').get();
            return snapshot.docs.map(doc => doc.id).filter(id => id.startsWith(prefix || ''));
        } catch (error) {
            console.error('Storage error:', error);
            return [];
        }
    },

    async delete(key) {
        if (!db) {
            console.error('Firebase not initialized');
            return false;
        }

        try {
            const userId = auth.currentUser?.uid || 'anonymous';
            await db.collection('users').doc(userId).collection('data').doc(key).delete();
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }
};

// App State
let workouts = [];
let weights = [];
let exerciseCounter = 0;
let currentWorkoutId = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    setupAuthListener();
    setupEventListeners();
    setTodayDate();
});

function setupAuthListener() {
    if (!auth) {
        console.error('Firebase Auth not initialized');
        return;
    }

    // Listen for auth state changes
    auth.onAuthStateChanged(async (user) => {
        currentUser = user;
        updateAuthUI(user);

        if (user) {
            // User is signed in, load data
            await loadData();
            renderStats();
            renderHistory();
            renderProgress();
        } else {
            // User is signed out
            workouts = [];
            weights = [];
        }
    });
}

function updateAuthUI(user) {
    const authBtn = document.getElementById('authBtn');
    const userInfo = document.getElementById('userInfo');

    if (user) {
        authBtn.textContent = 'Sign Out';
        authBtn.style.display = 'inline-block';
        userInfo.textContent = user.isAnonymous ? '👤 Anonymous User' : `👤 ${user.email || 'User'}`;
        userInfo.style.display = 'inline-block';
    } else {
        authBtn.textContent = 'Sign In Anonymously';
        authBtn.style.display = 'inline-block';
        userInfo.style.display = 'none';
    }
}

async function handleAuth() {
    if (!auth) return;

    try {
        if (currentUser) {
            // Sign out
            await auth.signOut();
            alert('Signed out successfully');
        } else {
            // Sign in anonymously
            await auth.signInAnonymously();
            alert('Signed in anonymously. Your data will be saved to this session.');
        }
    } catch (error) {
        console.error('Auth error:', error);
        alert('Authentication error: ' + error.message);
    }
}

async function loadData() {
    workouts = await Storage.get('workouts') || [];
    weights = await Storage.get('weights') || [];
}

async function saveData() {
    await Storage.set('workouts', workouts);
    await Storage.set('weights', weights);
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('workoutDate').value = today;
}

function setupEventListeners() {
    // Auth button
    const authBtn = document.getElementById('authBtn');
    if (authBtn) {
        authBtn.addEventListener('click', handleAuth);
    }

    // Navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => switchView(tab.dataset.view));
    });

    // Workout type toggle
    document.getElementById('workoutType').addEventListener('change', (e) => {
        const isStrength = e.target.value === 'strength';
        document.getElementById('strengthFields').style.display = isStrength ? 'block' : 'none';
        document.getElementById('cardioFields').style.display = isStrength ? 'none' : 'block';
    });

    // Template selection
    document.getElementById('workoutTemplate').addEventListener('change', (e) => {
        if (e.target.value) {
            loadTemplate(e.target.value);
        }
    });

    // Add exercise
    document.getElementById('addExerciseBtn').addEventListener('click', addExercise);

    // Save workout
    document.getElementById('saveWorkoutBtn').addEventListener('click', saveWorkout);

    // Add weight
    document.getElementById('addWeightBtn').addEventListener('click', addWeight);

    // Modal close
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('deleteWorkoutBtn').addEventListener('click', deleteCurrentWorkout);
}

function switchView(viewName) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
    document.getElementById(viewName).classList.add('active');

    if (viewName === 'stats') renderStats();
    if (viewName === 'history') renderHistory();
    if (viewName === 'progress') renderProgress();
}

function addExercise(name = '', sets = []) {
    const container = document.getElementById('exercisesContainer');
    const exerciseId = exerciseCounter++;

    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-entry';
    exerciseDiv.dataset.exerciseId = exerciseId;

    exerciseDiv.innerHTML = `
        <div class="exercise-entry-header">
            <input type="text" class="form-input" placeholder="Exercise name (e.g., Barbell Squat)" value="${name}" data-field="name">
            <button class="btn btn-danger btn-small" onclick="removeExercise(${exerciseId})">Remove</button>
        </div>
        <div class="sets-container" data-exercise-id="${exerciseId}">
            ${sets.length > 0 ? sets.map((s, i) => createSetRow(i + 1, s)).join('') : createSetRow(1)}
        </div>
        <button class="btn btn-secondary btn-small" onclick="addSet(${exerciseId})">+ Add Set</button>
    `;

    container.appendChild(exerciseDiv);
}

function createSetRow(setNum, set = {}) {
    return `
        <div class="set-row">
            <div class="set-number">Set ${setNum}</div>
            <div class="form-group" style="margin: 0;">
                <input type="number" class="form-input" placeholder="Reps" value="${set.reps || ''}" data-field="reps">
            </div>
            <div class="form-group" style="margin: 0;">
                <input type="number" class="form-input" placeholder="Weight" value="${set.weight || ''}" data-field="weight">
            </div>
            <button class="btn btn-danger btn-small" onclick="removeSet(this)">×</button>
        </div>
    `;
}

function addSet(exerciseId) {
    const container = document.querySelector(`.sets-container[data-exercise-id="${exerciseId}"]`);
    const setNum = container.querySelectorAll('.set-row').length + 1;
    container.insertAdjacentHTML('beforeend', createSetRow(setNum));
}

function removeSet(btn) {
    btn.closest('.set-row').remove();
}

function removeExercise(exerciseId) {
    document.querySelector(`[data-exercise-id="${exerciseId}"]`).closest('.exercise-entry').remove();
}

function loadTemplate(templateName) {
    const templates = {
        workoutA: {
            exercises: [
                { name: 'Barbell Back Squat', sets: [{reps: 5, weight: ''}, {reps: 5, weight: ''}, {reps: 5, weight: ''}] },
                { name: 'Barbell Bench Press', sets: [{reps: 5, weight: ''}, {reps: 5, weight: ''}, {reps: 5, weight: ''}] },
                { name: 'Barbell Row', sets: [{reps: 5, weight: ''}, {reps: 5, weight: ''}, {reps: 5, weight: ''}] }
            ]
        },
        workoutB: {
            exercises: [
                { name: 'Barbell Deadlift', sets: [{reps: 5, weight: ''}, {reps: 5, weight: ''}, {reps: 5, weight: ''}] },
                { name: 'Overhead Press', sets: [{reps: 5, weight: ''}, {reps: 5, weight: ''}, {reps: 5, weight: ''}] },
                { name: 'Pull-ups/Lat Pulldown', sets: [{reps: 8, weight: ''}, {reps: 8, weight: ''}, {reps: 8, weight: ''}] }
            ]
        }
    };

    const template = templates[templateName];
    if (template) {
        document.getElementById('exercisesContainer').innerHTML = '';
        exerciseCounter = 0;
        template.exercises.forEach(ex => addExercise(ex.name, ex.sets));
    }
}

async function saveWorkout() {
    const workoutType = document.getElementById('workoutType').value;
    const date = document.getElementById('workoutDate').value;
    const notes = document.getElementById('workoutNotes').value;
    const recovery = document.getElementById('recoveryScore').value;

    if (!date) {
        alert('Please select a date');
        return;
    }

    const workout = {
        id: Date.now(),
        type: workoutType,
        date: date,
        notes: notes,
        recovery: recovery ? parseInt(recovery) : null,
        timestamp: new Date().toISOString()
    };

    if (workoutType === 'strength') {
        const exercises = [];
        document.querySelectorAll('.exercise-entry').forEach(entry => {
            const name = entry.querySelector('[data-field="name"]').value;
            if (!name) return;

            const sets = [];
            entry.querySelectorAll('.set-row').forEach(row => {
                const reps = row.querySelector('[data-field="reps"]').value;
                const weight = row.querySelector('[data-field="weight"]').value;
                if (reps && weight) {
                    sets.push({ reps: parseInt(reps), weight: parseFloat(weight) });
                }
            });

            if (sets.length > 0) {
                exercises.push({ name, sets });
            }
        });

        if (exercises.length === 0) {
            alert('Please add at least one exercise with sets');
            return;
        }

        workout.exercises = exercises;
    } else {
        const activity = document.getElementById('cardioActivity').value;
        const duration = document.getElementById('cardioDuration').value;
        const distance = document.getElementById('cardioDistance').value;
        const hr = document.getElementById('cardioHR').value;

        if (!duration) {
            alert('Please enter workout duration');
            return;
        }

        workout.cardio = {
            activity,
            duration: parseInt(duration),
            distance: distance || null,
            avgHR: hr ? parseInt(hr) : null
        };
    }

    workouts.unshift(workout);
    await saveData();

    // Reset form
    document.getElementById('workoutNotes').value = '';
    document.getElementById('recoveryScore').value = '';
    document.getElementById('exercisesContainer').innerHTML = '';
    document.getElementById('cardioDuration').value = '';
    document.getElementById('cardioDistance').value = '';
    document.getElementById('cardioHR').value = '';
    exerciseCounter = 0;

    alert('Workout saved successfully!');
    renderStats();
}

async function addWeight() {
    const weight = document.getElementById('weightEntry').value;
    if (!weight) {
        alert('Please enter your weight');
        return;
    }

    weights.unshift({
        weight: parseFloat(weight),
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString()
    });

    await saveData();
    document.getElementById('weightEntry').value = '';
    renderProgress();
    alert('Weight logged!');
}

function renderHistory() {
    const container = document.getElementById('historyContainer');

    if (workouts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💪</div>
                <p>No workouts logged yet. Start tracking your progress!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = workouts.map(workout => {
        const summary = workout.type === 'strength'
            ? `${workout.exercises.length} exercises • ${workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)} total sets`
            : `${workout.cardio.activity} • ${workout.cardio.duration} min${workout.cardio.distance ? ' • ' + workout.cardio.distance : ''}`;

        return `
            <div class="workout-log-entry" onclick="showWorkoutDetail(${workout.id})">
                <div class="workout-log-header">
                    <span class="workout-type ${workout.type}">${workout.type.toUpperCase()}</span>
                    <span class="workout-date">${formatDate(workout.date)}</span>
                </div>
                <div class="workout-summary">${summary}</div>
                ${workout.recovery ? `<div class="workout-summary">Recovery: ${workout.recovery}/10</div>` : ''}
            </div>
        `;
    }).join('');
}

function showWorkoutDetail(workoutId) {
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) return;

    currentWorkoutId = workoutId;
    const modal = document.getElementById('workoutModal');
    const modalBody = document.getElementById('modalBody');

    let content = `
        <div class="workout-detail-section">
            <h4>Date: ${formatDate(workout.date)}</h4>
            ${workout.recovery ? `<p>Recovery Score: ${workout.recovery}/10</p>` : ''}
        </div>
    `;

    if (workout.type === 'strength') {
        content += '<div class="workout-detail-section"><h4>Exercises</h4>';
        workout.exercises.forEach(ex => {
            content += `
                <div class="exercise-detail">
                    <div class="exercise-name">${ex.name}</div>
                    <div class="sets-table">
                        ${ex.sets.map((set, i) => `Set ${i + 1}: ${set.reps} reps @ ${set.weight} lbs`).join('<br>')}
                    </div>
                </div>
            `;
        });
        content += '</div>';
    } else {
        content += `
            <div class="workout-detail-section">
                <h4>Cardio Details</h4>
                <p>Activity: ${workout.cardio.activity}</p>
                <p>Duration: ${workout.cardio.duration} minutes</p>
                ${workout.cardio.distance ? `<p>Distance: ${workout.cardio.distance}</p>` : ''}
                ${workout.cardio.avgHR ? `<p>Avg HR: ${workout.cardio.avgHR} bpm</p>` : ''}
            </div>
        `;
    }

    if (workout.notes) {
        content += `
            <div class="workout-detail-section">
                <h4>Notes</h4>
                <p>${workout.notes}</p>
            </div>
        `;
    }

    modalBody.innerHTML = content;
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('workoutModal').classList.remove('active');
    currentWorkoutId = null;
}

async function deleteCurrentWorkout() {
    if (!currentWorkoutId) return;

    if (!confirm('Are you sure you want to delete this workout?')) return;

    workouts = workouts.filter(w => w.id !== currentWorkoutId);
    await saveData();
    closeModal();
    renderHistory();
    renderStats();
    alert('Workout deleted');
}

function renderStats() {
    const statsGrid = document.getElementById('statsGrid');
    const weeklySummary = document.getElementById('weeklySummary');

    // Calculate stats
    const totalWorkouts = workouts.length;
    const strengthWorkouts = workouts.filter(w => w.type === 'strength').length;
    const cardioWorkouts = workouts.filter(w => w.type === 'cardio').length;

    const last7Days = workouts.filter(w => {
        const workoutDate = new Date(w.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return workoutDate >= weekAgo;
    });

    const avgRecovery = workouts.filter(w => w.recovery).length > 0
        ? (workouts.filter(w => w.recovery).reduce((acc, w) => acc + w.recovery, 0) / workouts.filter(w => w.recovery).length).toFixed(1)
        : 'N/A';

    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${totalWorkouts}</div>
            <div class="stat-label">Total Workouts</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${strengthWorkouts}</div>
            <div class="stat-label">Strength Sessions</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${cardioWorkouts}</div>
            <div class="stat-label">Cardio Sessions</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${last7Days.length}</div>
            <div class="stat-label">Last 7 Days</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${avgRecovery}</div>
            <div class="stat-label">Avg Recovery</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${weights.length > 0 ? weights[0].weight : 'N/A'}</div>
            <div class="stat-label">Current Weight</div>
        </div>
    `;

    // Weekly summary
    if (last7Days.length > 0) {
        const strengthCount = last7Days.filter(w => w.type === 'strength').length;
        const cardioCount = last7Days.filter(w => w.type === 'cardio').length;

        weeklySummary.innerHTML = `
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">Last 7 days activity:</p>
            <p>✓ ${strengthCount} strength session${strengthCount !== 1 ? 's' : ''}</p>
            <p>✓ ${cardioCount} cardio session${cardioCount !== 1 ? 's' : ''}</p>
            ${strengthCount >= 3 ? '<p style="color: var(--accent-primary); margin-top: 1rem;">🎯 3x/week minimum achieved!</p>' : ''}
        `;
    } else {
        weeklySummary.innerHTML = '<p style="color: var(--text-secondary);">No workouts in the last 7 days.</p>';
    }
}

function renderProgress() {
    const weightHistory = document.getElementById('weightHistory');
    const liftProgress = document.getElementById('liftProgressContainer');

    // Weight history
    if (weights.length > 0) {
        const recentWeights = weights.slice(0, 10);
        weightHistory.innerHTML = `
            <h4 style="color: var(--accent-primary); margin-bottom: 1rem;">Recent Weigh-Ins</h4>
            ${recentWeights.map(w => `
                <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 0.5rem;">
                    <span>${formatDate(w.date)}</span>
                    <span style="font-family: 'JetBrains Mono', monospace; color: var(--accent-primary);">${w.weight} lbs</span>
                </div>
            `).join('')}
        `;
    } else {
        weightHistory.innerHTML = '<p style="color: var(--text-secondary);">No weight entries yet.</p>';
    }

    // Lift progress (PR tracking)
    const lifts = {};
    workouts.filter(w => w.type === 'strength').forEach(workout => {
        workout.exercises.forEach(ex => {
            if (!lifts[ex.name]) lifts[ex.name] = [];
            ex.sets.forEach(set => {
                lifts[ex.name].push({ weight: set.weight, reps: set.reps, date: workout.date });
            });
        });
    });

    if (Object.keys(lifts).length > 0) {
        liftProgress.innerHTML = Object.keys(lifts).slice(0, 6).map(liftName => {
            const maxWeight = Math.max(...lifts[liftName].map(s => s.weight));
            const maxSet = lifts[liftName].find(s => s.weight === maxWeight);
            return `
                <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem;">
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">${liftName}</div>
                    <div style="font-family: 'JetBrains Mono', monospace; color: var(--accent-primary);">
                        PR: ${maxWeight} lbs × ${maxSet.reps} reps
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.25rem;">
                        ${formatDate(maxSet.date)}
                    </div>
                </div>
            `;
        }).join('');
    } else {
        liftProgress.innerHTML = '<p style="color: var(--text-secondary);">Start logging strength workouts to track PRs!</p>';
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
