import { i18n } from '../i18n.js';
import { auth } from '../auth.js';
import { showToast } from '../toast.js';

// Comprehensive food database
const foodDatabase = [
    // Proteins
    { id: 'chicken-breast', name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, category: 'protein' },
    { id: 'salmon', name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 12, fiber: 0, category: 'protein' },
    { id: 'eggs', name: 'Large Egg (1 egg)', calories: 70, protein: 6, carbs: 0.6, fat: 5, fiber: 0, category: 'protein' },
    { id: 'greek-yogurt', name: 'Greek Yogurt (100g)', calories: 100, protein: 10, carbs: 6, fat: 0.4, fiber: 0, category: 'protein' },
    
    // Carbohydrates
    { id: 'brown-rice', name: 'Brown Rice (100g cooked)', calories: 112, protein: 2.6, carbs: 22, fat: 0.9, fiber: 1.8, category: 'carbs' },
    { id: 'quinoa', name: 'Quinoa (100g cooked)', calories: 120, protein: 4.4, carbs: 22, fat: 1.9, fiber: 2.8, category: 'carbs' },
    { id: 'sweet-potato', name: 'Sweet Potato (100g)', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, category: 'carbs' },
    { id: 'oats', name: 'Oats (100g)', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, fiber: 10.6, category: 'carbs' },
    
    // Vegetables
    { id: 'broccoli', name: 'Broccoli (100g)', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, category: 'vegetables' },
    { id: 'spinach', name: 'Spinach (100g)', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, category: 'vegetables' },
    { id: 'carrots', name: 'Carrots (100g)', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, category: 'vegetables' },
    
    // Fruits
    { id: 'apple', name: 'Apple (1 medium)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4, category: 'fruits' },
    { id: 'banana', name: 'Banana (1 medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, category: 'fruits' },
    { id: 'blueberries', name: 'Blueberries (100g)', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, category: 'fruits' },
    
    // Healthy Fats
    { id: 'avocado', name: 'Avocado (100g)', calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, category: 'fats' },
    { id: 'almonds', name: 'Almonds (28g)', calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, category: 'fats' },
    { id: 'olive-oil', name: 'Olive Oil (1 tbsp)', calories: 119, protein: 0, carbs: 0, fat: 13.5, fiber: 0, category: 'fats' }
];

// User's nutrition data
let nutritionData = {
    todaysIntake: [],
    dailyGoals: {
        calories: 2000,
        protein: 150,
        carbs: 225,
        fat: 65,
        fiber: 25
    },
    waterIntake: 0,
    waterGoal: 8,
    weeklyStats: [
        { date: '2025-10-09', calories: 1890, protein: 140, carbs: 210, fat: 58, fiber: 22, water: 7 },
        { date: '2025-10-10', calories: 2100, protein: 155, carbs: 240, fat: 70, fiber: 28, water: 8 },
        { date: '2025-10-11', calories: 1950, protein: 145, carbs: 220, fat: 62, fiber: 25, water: 6 },
        { date: '2025-10-12', calories: 2200, protein: 160, carbs: 250, fat: 75, fiber: 30, water: 9 },
        { date: '2025-10-13', calories: 1800, protein: 135, carbs: 200, fat: 55, fiber: 20, water: 7 },
        { date: '2025-10-14', calories: 2050, protein: 150, carbs: 230, fat: 68, fiber: 26, water: 8 },
        { date: '2025-10-15', calories: 450, protein: 35, carbs: 45, fat: 15, fiber: 8, water: 3 }
    ]
};

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

const calculateTodaysNutrition = () => {
    return nutritionData.todaysIntake.reduce((totals, item) => {
        totals.calories += item.calories * item.quantity;
        totals.protein += item.protein * item.quantity;
        totals.carbs += item.carbs * item.quantity;
        totals.fat += item.fat * item.quantity;
        totals.fiber += item.fiber * item.quantity;
        return totals;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
};

const getNutritionRecommendations = (currentIntake, goals) => {
    const recommendations = [];
    
    if (currentIntake.protein < goals.protein * 0.7) {
        recommendations.push({
            type: 'protein',
            message: 'Consider adding more protein-rich foods like chicken, fish, or legumes.',
            icon: '🥩'
        });
    }
    
    if (currentIntake.fiber < goals.fiber * 0.6) {
        recommendations.push({
            type: 'fiber',
            message: 'Increase fiber intake with vegetables, fruits, and whole grains.',
            icon: '🥗'
        });
    }
    
    if (nutritionData.waterIntake < nutritionData.waterGoal * 0.5) {
        recommendations.push({
            type: 'hydration',
            message: 'Drink more water! You\'re behind on your hydration goal.',
            icon: '💧'
        });
    }
    
    return recommendations;
};

const renderNutritionOverview = () => {
    const currentIntake = calculateTodaysNutrition();
    const goals = nutritionData.dailyGoals;
    
    const getProgressColor = (current, goal) => {
        const percentage = (current / goal) * 100;
        if (percentage < 50) return '#ef4444';
        if (percentage < 80) return '#f59e0b';
        return '#10b981';
    };
    
    return `
        <div class="nutrition-overview">
            <div class="nutrition-summary">
                <h2>Today's Nutrition</h2>
                <div class="macros-grid">
                    <div class="macro-card calories">
                        <div class="macro-header">
                            <span class="macro-icon">🔥</span>
                            <span class="macro-label">Calories</span>
                        </div>
                        <div class="macro-values">
                            <span class="macro-current">${Math.round(currentIntake.calories)}</span>
                            <span class="macro-goal">/ ${goals.calories}</span>
                        </div>
                        <div class="macro-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min((currentIntake.calories / goals.calories) * 100, 100)}%; background: ${getProgressColor(currentIntake.calories, goals.calories)};"></div>
                            </div>
                            <span class="progress-percent">${Math.round((currentIntake.calories / goals.calories) * 100)}%</span>
                        </div>
                    </div>
                    
                    <div class="macro-card protein">
                        <div class="macro-header">
                            <span class="macro-icon">🥩</span>
                            <span class="macro-label">Protein</span>
                        </div>
                        <div class="macro-values">
                            <span class="macro-current">${Math.round(currentIntake.protein)}g</span>
                            <span class="macro-goal">/ ${goals.protein}g</span>
                        </div>
                        <div class="macro-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min((currentIntake.protein / goals.protein) * 100, 100)}%; background: ${getProgressColor(currentIntake.protein, goals.protein)};"></div>
                            </div>
                            <span class="progress-percent">${Math.round((currentIntake.protein / goals.protein) * 100)}%</span>
                        </div>
                    </div>
                    
                    <div class="macro-card carbs">
                        <div class="macro-header">
                            <span class="macro-icon">🍞</span>
                            <span class="macro-label">Carbs</span>
                        </div>
                        <div class="macro-values">
                            <span class="macro-current">${Math.round(currentIntake.carbs)}g</span>
                            <span class="macro-goal">/ ${goals.carbs}g</span>
                        </div>
                        <div class="macro-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min((currentIntake.carbs / goals.carbs) * 100, 100)}%; background: ${getProgressColor(currentIntake.carbs, goals.carbs)};"></div>
                            </div>
                            <span class="progress-percent">${Math.round((currentIntake.carbs / goals.carbs) * 100)}%</span>
                        </div>
                    </div>
                    
                    <div class="macro-card fat">
                        <div class="macro-header">
                            <span class="macro-icon">🥑</span>
                            <span class="macro-label">Fat</span>
                        </div>
                        <div class="macro-values">
                            <span class="macro-current">${Math.round(currentIntake.fat)}g</span>
                            <span class="macro-goal">/ ${goals.fat}g</span>
                        </div>
                        <div class="macro-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min((currentIntake.fat / goals.fat) * 100, 100)}%; background: ${getProgressColor(currentIntake.fat, goals.fat)};"></div>
                            </div>
                            <span class="progress-percent">${Math.round((currentIntake.fat / goals.fat) * 100)}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="water-tracker">
                    <div class="water-header">
                        <span class="water-icon">💧</span>
                        <span class="water-label">Water Intake</span>
                    </div>
                    <div class="water-glasses">
                        ${Array.from({length: nutritionData.waterGoal}, (_, i) => 
                            `<div class="water-glass ${i < nutritionData.waterIntake ? 'filled' : ''}" data-glass="${i}">💧</div>`
                        ).join('')}
                    </div>
                    <p>${nutritionData.waterIntake} / ${nutritionData.waterGoal} glasses</p>
                </div>
            </div>
            
            <div class="nutrition-recommendations">
                <h3>💡 Smart Recommendations</h3>
                ${getNutritionRecommendations(currentIntake, goals).map(rec => `
                    <div class="recommendation-item">
                        <span class="rec-icon">${rec.icon}</span>
                        <p>${rec.message}</p>
                    </div>
                `).join('') || '<p class="no-recommendations">Great job! You\'re on track with your nutrition goals.</p>'}
            </div>
        </div>
    `;
};

const renderFoodLogging = () => `
    <div class="food-logging">
        <div class="logging-header">
            <h3>🍽️ Log Your Meals</h3>
            <button class="button-primary" data-add-food>+ Add Food</button>
        </div>
        
        <div class="meal-sections">
            ${mealTypes.map(mealType => {
                const mealFoods = nutritionData.todaysIntake.filter(item => item.mealType === mealType);
                const mealCalories = mealFoods.reduce((sum, item) => sum + (item.calories * item.quantity), 0);
                
                return `
                    <div class="meal-section">
                        <div class="meal-header">
                            <h4>${mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h4>
                            <span class="meal-calories">${Math.round(mealCalories)} cal</span>
                        </div>
                        <div class="meal-foods">
                            ${mealFoods.length > 0 ? mealFoods.map(food => `
                                <div class="food-item">
                                    <div class="food-info">
                                        <strong>${food.name}</strong>
                                        <span>Qty: ${food.quantity} • ${Math.round(food.calories * food.quantity)} cal</span>
                                    </div>
                                    <button class="remove-food" data-remove-food="${food.id}-${mealType}">×</button>
                                </div>
                            `).join('') : `
                                <div class="empty-meal">
                                    <p>No foods logged for ${mealType}</p>
                                    <button class="button-secondary small" data-add-to-meal="${mealType}">Add Food</button>
                                </div>
                            `}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    </div>
`;

const renderWeeklyChart = () => {
    const weekData = nutritionData.weeklyStats;
    return `
        <div class="weekly-chart">
            <h3>📊 Weekly Nutrition Trends</h3>
            <div class="chart-container">
                <svg viewBox="0 0 500 300" class="nutrition-chart">
                    <!-- Grid lines -->
                    ${[1,2,3,4,5].map(i => 
                        `<line x1="50" y1="${i * 50}" x2="450" y2="${i * 50}" stroke="#f0f0f0" stroke-width="1"/>`
                    ).join('')}
                    
                    <!-- Calories line -->
                    <polyline 
                        points="${weekData.map((d, i) => `${i * 60 + 70},${250 - ((d.calories / 2500) * 200)}`).join(' ')}"
                        fill="none" 
                        stroke="#ef4444" 
                        stroke-width="3"
                        stroke-linecap="round"
                    />
                    
                    <!-- Protein line -->
                    <polyline 
                        points="${weekData.map((d, i) => `${i * 60 + 70},${250 - ((d.protein / 200) * 200)}`).join(' ')}"
                        fill="none" 
                        stroke="#10b981" 
                        stroke-width="3"
                        stroke-linecap="round"
                    />
                    
                    <!-- Water line -->
                    <polyline 
                        points="${weekData.map((d, i) => `${i * 60 + 70},${250 - ((d.water / 10) * 200)}`).join(' ')}"
                        fill="none" 
                        stroke="#3b82f6" 
                        stroke-width="3"
                        stroke-linecap="round"
                    />
                    
                    <!-- Data points -->
                    ${weekData.map((d, i) => `
                        <circle cx="${i * 60 + 70}" cy="${250 - ((d.calories / 2500) * 200)}" r="4" fill="#ef4444"/>
                        <circle cx="${i * 60 + 70}" cy="${250 - ((d.protein / 200) * 200)}" r="4" fill="#10b981"/>
                        <circle cx="${i * 60 + 70}" cy="${250 - ((d.water / 10) * 200)}" r="4" fill="#3b82f6"/>
                    `).join('')}
                    
                    <!-- X-axis labels -->
                    ${weekData.map((d, i) => `
                        <text x="${i * 60 + 70}" y="270" text-anchor="middle" fill="#6b7280" font-size="12">
                            ${new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </text>
                    `).join('')}
                </svg>
                <div class="chart-legend">
                    <div class="legend-item">
                        <span class="legend-color" style="background: #ef4444;"></span>
                        <span>Calories</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background: #10b981;"></span>
                        <span>Protein (g)</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background: #3b82f6;"></span>
                        <span>Water (glasses)</span>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const renderFoodSearch = () => `
    <div class="food-search-modal" data-food-search-modal style="display: none;">
        <div class="modal-overlay" data-close-modal></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add Food</h3>
                <button class="modal-close" data-close-modal>×</button>
            </div>
            <div class="modal-body">
                <div class="search-box">
                    <input type="text" placeholder="Search for food..." data-food-search-input>
                    <button class="search-btn" data-search-foods>🔍</button>
                </div>
                
                <div class="food-categories">
                    <button class="category-btn active" data-category="all">All</button>
                    <button class="category-btn" data-category="protein">Protein</button>
                    <button class="category-btn" data-category="carbs">Carbs</button>
                    <button class="category-btn" data-category="vegetables">Vegetables</button>
                    <button class="category-btn" data-category="fruits">Fruits</button>
                    <button class="category-btn" data-category="fats">Fats</button>
                </div>
                
                <div class="food-results" data-food-results>
                    ${foodDatabase.map(food => `
                        <div class="food-result" data-food-id="${food.id}">
                            <div class="food-details">
                                <strong>${food.name}</strong>
                                <div class="food-nutrition">
                                    ${food.calories} cal • ${food.protein}g protein • ${food.carbs}g carbs • ${food.fat}g fat
                                </div>
                            </div>
                            <div class="food-actions">
                                <input type="number" value="1" min="0.1" step="0.1" class="quantity-input" data-quantity>
                                <select class="meal-select" data-meal-select>
                                    <option value="breakfast">Breakfast</option>
                                    <option value="lunch">Lunch</option>
                                    <option value="dinner">Dinner</option>
                                    <option value="snacks">Snacks</option>
                                </select>
                                <button class="button-primary small" data-add-food-item="${food.id}">Add</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>
`;

export const NutritionTrackerPage = {
    isPublic: false,
    getTitle() {
        return 'Nutrition Tracker • DoCare Health';
    },
    render() {
        return `
            <section class="nutrition-tracker">
                <header class="nutrition-header">
                    <h1>🥗 Nutrition Tracker</h1>
                    <p>Track your daily nutrition, set goals, and get personalized recommendations for optimal health.</p>
                </header>
                
                ${renderNutritionOverview()}
                ${renderFoodLogging()}
                ${renderWeeklyChart()}
                ${renderFoodSearch()}
            </section>
        `;
    },
    afterRender() {
        // Water intake tracking
        const waterGlasses = document.querySelectorAll('.water-glass');
        waterGlasses.forEach((glass, index) => {
            glass.addEventListener('click', () => {
                if (index < nutritionData.waterIntake) {
                    // Remove water
                    nutritionData.waterIntake = index;
                } else {
                    // Add water
                    nutritionData.waterIntake = index + 1;
                }
                // Re-render the water tracker
                const waterTracker = document.querySelector('.water-tracker');
                const newWaterTracker = document.createElement('div');
                newWaterTracker.innerHTML = `
                    <div class="water-header">
                        <span class="water-icon">💧</span>
                        <span class="water-label">Water Intake</span>
                    </div>
                    <div class="water-glasses">
                        ${Array.from({length: nutritionData.waterGoal}, (_, i) => 
                            `<div class="water-glass ${i < nutritionData.waterIntake ? 'filled' : ''}" data-glass="${i}">💧</div>`
                        ).join('')}
                    </div>
                    <p>${nutritionData.waterIntake} / ${nutritionData.waterGoal} glasses</p>
                `;
                newWaterTracker.className = 'water-tracker';
                waterTracker.replaceWith(newWaterTracker);
                // Reattach event listeners
                this.afterRender();
            });
        });

        // Food search modal
        const addFoodBtns = document.querySelectorAll('[data-add-food], [data-add-to-meal]');
        const foodSearchModal = document.querySelector('[data-food-search-modal]');
        const closeModalBtns = document.querySelectorAll('[data-close-modal]');

        addFoodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                foodSearchModal.style.display = 'flex';
            });
        });

        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                foodSearchModal.style.display = 'none';
            });
        });

        // Food category filtering
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const category = btn.dataset.category;
                const foodResults = document.querySelectorAll('.food-result');
                
                foodResults.forEach(result => {
                    const foodId = result.dataset.foodId;
                    const food = foodDatabase.find(f => f.id === foodId);
                    
                    if (category === 'all' || food.category === category) {
                        result.style.display = 'flex';
                    } else {
                        result.style.display = 'none';
                    }
                });
            });
        });

        // Add food to meal
        const addFoodBtns2 = document.querySelectorAll('[data-add-food-item]');
        addFoodBtns2.forEach(btn => {
            btn.addEventListener('click', () => {
                const foodId = btn.dataset.addFoodItem;
                const food = foodDatabase.find(f => f.id === foodId);
                const result = btn.closest('.food-result');
                const quantity = parseFloat(result.querySelector('[data-quantity]').value);
                const mealType = result.querySelector('[data-meal-select]').value;
                
                // Add to today's intake
                nutritionData.todaysIntake.push({
                    ...food,
                    quantity: quantity,
                    mealType: mealType,
                    timestamp: new Date().toISOString()
                });

                showToast(`Added ${food.name} to ${mealType}!`, { variant: 'success', duration: 2000 });
                foodSearchModal.style.display = 'none';
                
                // Re-render the page to show updated nutrition
                setTimeout(() => {
                    window.__appRouter?.navigate('/nutrition-tracker');
                }, 500);
            });
        });

        // Food search functionality
        const searchInput = document.querySelector('[data-food-search-input]');
        const searchBtn = document.querySelector('[data-search-foods]');
        
        const performSearch = () => {
            const query = searchInput.value.toLowerCase();
            const foodResults = document.querySelectorAll('.food-result');
            
            foodResults.forEach(result => {
                const foodId = result.dataset.foodId;
                const food = foodDatabase.find(f => f.id === foodId);
                const foodName = food.name.toLowerCase();
                
                if (foodName.includes(query) || query === '') {
                    result.style.display = 'flex';
                } else {
                    result.style.display = 'none';
                }
            });
        };

        searchInput?.addEventListener('input', performSearch);
        searchBtn?.addEventListener('click', performSearch);

        // Remove food functionality
        const removeFoodBtns = document.querySelectorAll('[data-remove-food]');
        removeFoodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const [foodId, mealType] = btn.dataset.removeFood.split('-');
                
                // Find and remove the food item
                const index = nutritionData.todaysIntake.findIndex(item => 
                    item.id === foodId && item.mealType === mealType
                );
                
                if (index > -1) {
                    const removedFood = nutritionData.todaysIntake.splice(index, 1)[0];
                    showToast(`Removed ${removedFood.name}`, { variant: 'info', duration: 2000 });
                    
                    // Re-render the page
                    setTimeout(() => {
                        window.__appRouter?.navigate('/nutrition-tracker');
                    }, 500);
                }
            });
        });

        console.log('Nutrition Tracker page initialized');
    }
};