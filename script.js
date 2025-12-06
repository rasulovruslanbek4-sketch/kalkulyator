// ============================================
// GLOBAL VARIABLES AND INITIALIZATION
// ============================================

// Sayt holatini saqlash
let currentTheme = localStorage.getItem('theme') || 'light';
let calculationHistory = JSON.parse(localStorage.getItem('calculationHistory')) || [];

// Konvertatsiya kurslari
const currencyRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 147.68,
    UZS: 12200,
    RUB: 96.45,
    CNY: 7.29,
    KRW: 1315.47,
    INR: 83.12
};

// Kalkulyator holati
let calculatorState = {
    currentInput: '0',
    previousInput: '',
    operator: null,
    resetInput: false,
    displayHistory: '',
    lastCalculation: null
};

// ============================================
// SAYT YUKLANGANDA ISHGA TUSHADIGAN FUNKSIYALAR
// ============================================

// Hujjat yuklanganda barcha funksiyalarni ishga tushiramiz
document.addEventListener('DOMContentLoaded', function() {
    // 1. Tema sozlamalarini yuklash
    initializeTheme();
    
    // 2. Navigatsiya faol sahifani belgilash
    highlightActivePage();
    
    // 3. Sahifa turiga qarab mos funksiyalarni ishga tushiramiz
    if (document.querySelector('.calculator-section')) {
        initializeCalculator();
    }
    
    if (document.querySelector('.history-section')) {
        initializeHistoryPage();
    }
    
    if (document.querySelector('.converter-section')) {
        initializeConverter();
    }
    
    // 4. Animatsiyalarni boshlash
    startAnimations();
});

// ============================================
// TEMA SOZLAMALARI
// ============================================

function initializeTheme() {
    // Tema tugmasini topamiz
    const themeToggle = document.querySelector('.toggle-switch');
    const toggleCircle = document.querySelector('.toggle-circle');
    
    // Saqlangan temani o'rnatamiz
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (toggleCircle) {
            toggleCircle.style.left = '27px';
        }
    }
    
    // Tema o'zgartirish tugmasi ishlashi
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const toggleCircle = document.querySelector('.toggle-circle');
    const isDarkMode = document.body.classList.toggle('dark-mode');
    
    // Toggle circle holatini o'zgartiramiz
    if (toggleCircle) {
        toggleCircle.style.left = isDarkMode ? '27px' : '3px';
    }
    
    // Yangi temani saqlaymiz
    currentTheme = isDarkMode ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    
    // Tema o'zgarganda maxsus hodisa yaratamiz
    document.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { theme: currentTheme }
    }));
}

// ============================================
// NAVIGATSIYA VA SAHIFA SOZLAMALARI
// ============================================

function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ============================================
// KALKULYATOR FUNKSIYALARI
// ============================================

function initializeCalculator() {
    // Kalkulyator tugmalariga hodisa qo'shamiz
    const calcButtons = document.querySelectorAll('.calc-btn');
    calcButtons.forEach(button => {
        button.addEventListener('click', handleCalculatorButton);
    });
    
    // Klaviaturadan foydalanish imkoniyati
    document.addEventListener('keydown', handleKeyboardInput);
    
    // Dizplayni yangilaymiz
    updateCalculatorDisplay();
}

function handleCalculatorButton(event) {
    const button = event.currentTarget;
    const action = button.dataset.action;
    const number = button.dataset.number;
    
    // Tugma bosilgan animatsiyasi
    animateButtonClick(button);
    
    // Tugma turiga qarab ishlaymiz
    if (number !== undefined) {
        inputNumber(number);
    } else if (action) {
        handleCalculatorAction(action);
    }
    
    // Ekranni yangilaymiz
    updateCalculatorDisplay();
}

function animateButtonClick(button) {
    button.style.transform = 'scale(0.95)';
    button.style.transition = 'transform 0.1s';
    
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 100);
}

function inputNumber(num) {
    if (calculatorState.resetInput) {
        calculatorState.currentInput = num;
        calculatorState.resetInput = false;
    } else {
        calculatorState.currentInput = 
            calculatorState.currentInput === '0' ? 
            num : calculatorState.currentInput + num;
    }
}

function handleCalculatorAction(action) {
    switch (action) {
        case 'clear':
            clearCalculator();
            break;
        case 'backspace':
            backspace();
            break;
        case 'percentage':
            calculatePercentage();
            break;
        case 'add':
        case 'subtract':
        case 'multiply':
        case 'divide':
            setOperator(action);
            break;
        case 'equals':
            calculate();
            break;
        case '.':
            addDecimal();
            break;
    }
}

function clearCalculator() {
    calculatorState = {
        currentInput: '0',
        previousInput: '',
        operator: null,
        resetInput: false,
        displayHistory: '',
        lastCalculation: null
    };
}

function backspace() {
    if (calculatorState.currentInput.length > 1) {
        calculatorState.currentInput = calculatorState.currentInput.slice(0, -1);
    } else {
        calculatorState.currentInput = '0';
    }
}

function calculatePercentage() {
    const current = parseFloat(calculatorState.currentInput);
    if (!isNaN(current)) {
        calculatorState.currentInput = (current / 100).toString();
    }
}

function setOperator(op) {
    if (calculatorState.operator !== null && !calculatorState.resetInput) {
        calculate();
    }
    
    calculatorState.previousInput = calculatorState.currentInput;
    calculatorState.operator = op;
    calculatorState.resetInput = true;
    
    // Tarix displeyini yangilaymiz
    const operatorSymbol = getOperatorSymbol(op);
    calculatorState.displayHistory = `${formatNumber(calculatorState.previousInput)} ${operatorSymbol}`;
}

function calculate() {
    if (calculatorState.operator === null || calculatorState.resetInput) {
        return;
    }
    
    const prev = parseFloat(calculatorState.previousInput);
    const current = parseFloat(calculatorState.currentInput);
    
    if (isNaN(prev) || isNaN(current)) {
        return;
    }
    
    let result;
    const operatorSymbol = getOperatorSymbol(calculatorState.operator);
    
    switch (calculatorState.operator) {
        case 'add':
            result = prev + current;
            break;
        case 'subtract':
            result = prev - current;
            break;
        case 'multiply':
            result = prev * current;
            break;
        case 'divide':
            if (current === 0) {
                alert("Nolga bo'lish mumkin emas!");
                clearCalculator();
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }
    
    // Natijani saqlaymiz
    calculatorState.currentInput = result.toString();
    calculatorState.lastCalculation = {
        expression: `${calculatorState.previousInput} ${operatorSymbol} ${calculatorState.currentInput}`,
        result: result.toString()
    };
    
    // Tarixga qo'shamiz
    addToHistory(
        `${formatNumber(calculatorState.previousInput)} ${operatorSymbol} ${formatNumber(calculatorState.currentInput)}`,
        formatNumber(result.toString())
    );
    
    // Holatni yangilaymiz
    calculatorState.operator = null;
    calculatorState.previousInput = '';
    calculatorState.displayHistory = '';
    calculatorState.resetInput = true;
}

function addDecimal() {
    if (calculatorState.resetInput) {
        calculatorState.currentInput = '0.';
        calculatorState.resetInput = false;
    } else if (!calculatorState.currentInput.includes('.')) {
        calculatorState.currentInput += '.';
    }
}

function getOperatorSymbol(op) {
    const symbols = {
        'add': '+',
        'subtract': '−',
        'multiply': '×',
        'divide': '÷'
    };
    return symbols[op] || '';
}

function updateCalculatorDisplay() {
    const displayInput = document.querySelector('.display-input');
    const displayHistory = document.querySelector('.display-history');
    
    if (displayInput) {
        displayInput.textContent = formatNumber(calculatorState.currentInput);
    }
    
    if (displayHistory) {
        displayHistory.textContent = calculatorState.displayHistory;
    }
}

// ============================================
// KLAVIATURA QO'LLAB-QUVVATLASH
// ============================================

function handleKeyboardInput(event) {
    const key = event.key;
    
    // Raqamlar
    if (/[0-9]/.test(key)) {
        inputNumber(key);
        updateCalculatorDisplay();
    }
    
    // Operatorlar
    else if (key === '+') {
        setOperator('add');
        updateCalculatorDisplay();
    }
    else if (key === '-') {
        setOperator('subtract');
        updateCalculatorDisplay();
    }
    else if (key === '*') {
        setOperator('multiply');
        updateCalculatorDisplay();
    }
    else if (key === '/') {
        event.preventDefault();
        setOperator('divide');
        updateCalculatorDisplay();
    }
    
    // Boshqa amallar
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
        updateCalculatorDisplay();
    }
    else if (key === 'Escape' || key === 'Delete') {
        clearCalculator();
        updateCalculatorDisplay();
    }
    else if (key === 'Backspace') {
        backspace();
        updateCalculatorDisplay();
    }
    else if (key === '.') {
        addDecimal();
        updateCalculatorDisplay();
    }
    else if (key === '%') {
        calculatePercentage();
        updateCalculatorDisplay();
    }
}


function initializeHistoryPage() {
    // Tarixni yuklash
    loadHistory();
    
    // Tugmalarga hodisa qo'shamiz
    const clearBtn = document.getElementById('clear-history');
    const exportBtn = document.getElementById('export-history');
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearHistory);
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportHistory);
    }
    
    // Tarix statistikasini yangilaymiz
    updateHistoryStats();
}

function addToHistory(expression, result) {
    const calculation = {
        id: Date.now(),
        expression: expression,
        result: result,
        timestamp: new Date().toLocaleString(),
        date: new Date().toISOString().split('T')[0]
    };
    
    calculationHistory.unshift(calculation);
    
    // Faqat oxirgi 100 ta hisobni saqlaymiz
    if (calculationHistory.length > 100) {
        calculationHistory = calculationHistory.slice(0, 100);
    }
    
    // LocalStorage ga saqlaymiz
    localStorage.setItem('calculationHistory', JSON.stringify(calculationHistory));
    
    // Tarix sahifasini yangilaymiz
    if (document.querySelector('.history-section')) {
        renderHistory();
        updateHistoryStats();
    }
}

function loadHistory() {
    const savedHistory = localStorage.getItem('calculationHistory');
    if (savedHistory) {
        calculationHistory = JSON.parse(savedHistory);
        renderHistory();
    }
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    if (calculationHistory.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-history fa-3x"></i>
                <h3>Hisob-kitoblar tarixi bo'sh</h3>
                <p>Kalkulyatordan foydalanganingizdan so'ng hisob-kitoblar shu yerda ko'rinadi</p>
                <a href="index.html#calculator" class="btn-primary">Kalkulyatorga o'tish</a>
            </div>
        `;
        return;
    }
    
    let html = '';
    calculationHistory.forEach((calc, index) => {
        html += `
            <div class="history-item" style="animation-delay: ${index * 0.05}s">
                <div class="history-info">
                    <div class="history-calculation">${calc.expression} =</div>
                    <div class="history-date">${calc.timestamp}</div>
                </div>
                <div class="history-result">${calc.result}</div>
            </div>
        `;
    });
    
    historyList.innerHTML = html;
}

function clearHistory() {
    if (calculationHistory.length === 0) {
        alert("Tarixda hech narsa yo'q!");
        return;
    }
    
    if (confirm("Barcha hisob-kitoblar tarixini o'chirishni istaysizmi?")) {
        calculationHistory = [];
        localStorage.removeItem('calculationHistory');
        renderHistory();
        updateHistoryStats();
        
        // Animatsiya
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = `
            <div class="empty-history" style="animation: fadeIn 0.5s">
                <i class="fas fa-trash-restore fa-3x"></i>
                <h3>Tarix tozalandi</h3>
                <p>Barcha hisob-kitoblar tarixi o'chirildi</p>
            </div>
        `;
    }
}

function exportHistory() {
    if (calculationHistory.length === 0) {
        alert("Eksport qilish uchun tarix bo'sh!");
        return;
    }
    
    // CSV formatida tayyorlaymiz
    let csvContent = "Hisob-kitob,Natija,Sana,Vaqt\n";
    
    calculationHistory.forEach(calc => {
        const [date, time] = calc.timestamp.split(', ');
        csvContent += `"${calc.expression}","${calc.result}","${date}","${time}"\n`;
    });
    
    // Fayl yuklab olish
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "kalkulyator_tarixi_" + new Date().toISOString().split('T')[0] + ".csv");
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Xabar ko'rsatamiz
    alert(`Tarix fayli muvaffaqiyatli yuklab olindi! Jami ${calculationHistory.length} ta hisob-kitob.`);
}

function updateHistoryStats() {
    const totalEl = document.getElementById('total-calculations');
    const todayEl = document.getElementById('today-calculations');
    const operatorEl = document.getElementById('most-used-operator');
    
    if (!totalEl || !todayEl || !operatorEl) return;
    
    // Jami hisob-kitoblar
    totalEl.textContent = calculationHistory.length;
    
    // Bugungi hisob-kitoblar
    const today = new Date().toISOString().split('T')[0];
    const todayCount = calculationHistory.filter(calc => calc.date === today).length;
    todayEl.textContent = todayCount;
    
    // Ko'p ishlatilgan operator
    const operators = [];
    calculationHistory.forEach(calc => {
        if (calc.expression.includes('+')) operators.push('+');
        if (calc.expression.includes('−')) operators.push('−');
        if (calc.expression.includes('×')) operators.push('×');
        if (calc.expression.includes('÷')) operators.push('÷');
    });
    
    if (operators.length > 0) {
        const counts = {};
        operators.forEach(op => counts[op] = (counts[op] || 0) + 1);
        
        const mostUsed = Object.keys(counts).reduce((a, b) => 
            counts[a] > counts[b] ? a : b
        );
        operatorEl.textContent = mostUsed;
    } else {
        operatorEl.textContent = "Yo'q";
    }
}


function initializeConverter() {
    // Tablar ustida ishlash
    const converterTabs = document.querySelectorAll('.converter-tab');
    converterTabs.forEach(tab => {
        tab.addEventListener('click', switchConverterTab);
    });
    
    // Valyuta konvertori
    setupCurrencyConverter();
    
    // Uzunlik konvertori
    setupLengthConverter();
    
    // Harorat konvertori
    setupTemperatureConverter();
    
    // Dastlabki konvertatsiyani bajarish
    performCurrencyConversion();
    performLengthConversion();
    performTemperatureConversion();
}

function switchConverterTab(event) {
    const tab = event.currentTarget;
    const converterType = tab.dataset.converter;
    
    // Faol tabni o'zgartirish
    document.querySelectorAll('.converter-tab').forEach(t => {
        t.classList.remove('active');
    });
    tab.classList.add('active');
    
    // Kontentni ko'rsatish
    document.querySelectorAll('.converter-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetContent = document.getElementById(`${converterType}-converter`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

// VALYUTA KONVERTORI
function setupCurrencyConverter() {
    const convertBtn = document.getElementById('convert-currency');
    const swapBtn = document.getElementById('swap-currencies');
    
    if (convertBtn) {
        convertBtn.addEventListener('click', performCurrencyConversion);
    }
    
    if (swapBtn) {
        swapBtn.addEventListener('click', swapCurrencies);
    }
    
    // Input o'zgarishlarini kuzatish
    const amountInput = document.getElementById('currency-amount');
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    
    if (amountInput) amountInput.addEventListener('input', performCurrencyConversion);
    if (fromSelect) fromSelect.addEventListener('change', performCurrencyConversion);
    if (toSelect) toSelect.addEventListener('change', performCurrencyConversion);
}

function performCurrencyConversion() {
    const amount = parseFloat(document.getElementById('currency-amount').value) || 0;
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;
    
    if (!fromCurrency || !toCurrency || isNaN(amount)) return;
    
    // Konvertatsiya
    const fromRate = currencyRates[fromCurrency] || 1;
    const toRate = currencyRates[toCurrency] || 1;
    
    const result = (amount / fromRate) * toRate;
    
    // Natijani ko'rsatish
    const resultElement = document.getElementById('currency-result');
    if (resultElement) {
        resultElement.innerHTML = `
            <strong>${formatNumber(amount)} ${fromCurrency}</strong> = 
            <strong class="highlight">${formatNumber(result.toFixed(4))} ${toCurrency}</strong>
        `;
    }
    
    // Kurslarni ko'rsatish
    const rate = toRate / fromRate;
    document.getElementById('currency-date').textContent = 
        `1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}`;
}

function swapCurrencies() {
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    
    if (!fromSelect || !toSelect) return;
    
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    
    // Animatsiya
    const swapBtn = document.getElementById('swap-currencies');
    swapBtn.style.transform = 'rotate(360deg)';
    swapBtn.style.transition = 'transform 0.5s';
    
    setTimeout(() => {
        swapBtn.style.transform = 'rotate(0deg)';
    }, 500);
    
    // Konvertatsiyani yangilash
    performCurrencyConversion();
}

// UZUNLIK KONVERTORI
function setupLengthConverter() {
    const convertBtn = document.getElementById('convert-length');
    const swapBtn = document.getElementById('swap-length');
    
    if (convertBtn) {
        convertBtn.addEventListener('click', performLengthConversion);
    }
    
    if (swapBtn) {
        swapBtn.addEventListener('click', swapLengthUnits);
    }
    
    // Input o'zgarishlarini kuzatish
    const lengthInput = document.getElementById('length-value');
    const fromSelect = document.getElementById('from-length');
    const toSelect = document.getElementById('to-length');
    
    if (lengthInput) lengthInput.addEventListener('input', performLengthConversion);
    if (fromSelect) fromSelect.addEventListener('change', performLengthConversion);
    if (toSelect) toSelect.addEventListener('change', performLengthConversion);
}

// Uzunlik konvertatsiya omillari (metrga nisbatan)
const lengthConversionFactors = {
    meter: 1,
    kilometer: 0.001,
    centimeter: 100,
    millimeter: 1000,
    mile: 0.000621371,
    yard: 1.09361,
    foot: 3.28084,
    inch: 39.3701
};

function performLengthConversion() {
    const value = parseFloat(document.getElementById('length-value').value) || 0;
    const fromUnit = document.getElementById('from-length').value;
    const toUnit = document.getElementById('to-length').value;
    
    if (!fromUnit || !toUnit || isNaN(value)) return;
    
    // Metrga o'tkazamiz, keyin kerakli birlikka
    const valueInMeters = value / lengthConversionFactors[fromUnit];
    const result = valueInMeters * lengthConversionFactors[toUnit];
    
    // Natijani ko'rsatish
    const resultElement = document.getElementById('length-result');
    if (resultElement) {
        resultElement.innerHTML = `
            <strong>${formatNumber(value)} ${getUnitSymbol(fromUnit)}</strong> = 
            <strong class="highlight">${formatNumber(result.toFixed(6))} ${getUnitSymbol(toUnit)}</strong>
        `;
    }
}

function getUnitSymbol(unit) {
    const symbols = {
        meter: 'm',
        kilometer: 'km',
        centimeter: 'cm',
        millimeter: 'mm',
        mile: 'mi',
        yard: 'yd',
        foot: 'ft',
        inch: 'in'
    };
    return symbols[unit] || unit;
}

function swapLengthUnits() {
    const fromSelect = document.getElementById('from-length');
    const toSelect = document.getElementById('to-length');
    
    if (!fromSelect || !toSelect) return;
    
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    
    performLengthConversion();
}

// HARORAT KONVERTORI
function setupTemperatureConverter() {
    const convertBtn = document.getElementById('convert-temp');
    const swapBtn = document.getElementById('swap-temp');
    
    if (convertBtn) {
        convertBtn.addEventListener('click', performTemperatureConversion);
    }
    
    if (swapBtn) {
        swapBtn.addEventListener('click', swapTemperatureUnits);
    }
    
    // Input o'zgarishlarini kuzatish
    const tempInput = document.getElementById('temp-value');
    const fromSelect = document.getElementById('from-temp');
    const toSelect = document.getElementById('to-temp');
    
    if (tempInput) tempInput.addEventListener('input', performTemperatureConversion);
    if (fromSelect) fromSelect.addEventListener('change', performTemperatureConversion);
    if (toSelect) toSelect.addEventListener('change', performTemperatureConversion);
}

function performTemperatureConversion() {
    const value = parseFloat(document.getElementById('temp-value').value) || 0;
    const fromUnit = document.getElementById('from-temp').value;
    const toUnit = document.getElementById('to-temp').value;
    
    if (!fromUnit || !toUnit || isNaN(value)) return;
    
    let result;
    
    // Selsiyga o'tkazamiz
    let celsius;
    switch (fromUnit) {
        case 'celsius':
            celsius = value;
            break;
        case 'fahrenheit':
            celsius = (value - 32) * 5/9;
            break;
        case 'kelvin':
            celsius = value - 273.15;
            break;
        default:
            celsius = value;
    }
    
    // Kerakli birlikka o'tkazamiz
    switch (toUnit) {
        case 'celsius':
            result = celsius;
            break;
        case 'fahrenheit':
            result = (celsius * 9/5) + 32;
            break;
        case 'kelvin':
            result = celsius + 273.15;
            break;
        default:
            result = celsius;
    }
    
    // Natijani ko'rsatish
    const resultElement = document.getElementById('temp-result');
    if (resultElement) {
        resultElement.innerHTML = `
            <strong>${formatNumber(value)} ${getTemperatureSymbol(fromUnit)}</strong> = 
            <strong class="highlight">${formatNumber(result.toFixed(2))} ${getTemperatureSymbol(toUnit)}</strong>
        `;
    }
}

function getTemperatureSymbol(unit) {
    const symbols = {
        celsius: '°C',
        fahrenheit: '°F',
        kelvin: 'K'
    };
    return symbols[unit] || unit;
}

function swapTemperatureUnits() {
    const fromSelect = document.getElementById('from-temp');
    const toSelect = document.getElementById('to-temp');
    
    if (!fromSelect || !toSelect) return;
    
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    
    performTemperatureConversion();
}


function formatNumber(numStr) {
    const num = parseFloat(numStr);
    if (isNaN(num)) return '0';
    
    // Katta sonlarni formatlash
    if (Math.abs(num) >= 1e9) {
        return num.toExponential(4);
    }
    
    // Kasr sonlarni formatlash
    if (Math.abs(num) < 0.000001 && num !== 0) {
        return num.toExponential(6);
    }
    
    // Oddiy formatlash
    const options = {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8
    };
    
    let formatted = num.toLocaleString('en-US', options);
    
    // Agar nuqta bilan tugasa, nuqtadan keyingi nollarni olib tashlaymiz
    if (formatted.includes('.')) {
        formatted = formatted.replace(/\.?0+$/, '');
    }
    
    return formatted;
}

function startAnimations() {
    // Sarlavha animatsiyasi
    const animatedTitles = document.querySelectorAll('.animated-title');
    animatedTitles.forEach((title, index) => {
        title.style.animationDelay = `${index * 0.2}s`;
    });
    
    // Feature kartalar animatsiyasi
    const features = document.querySelectorAll('.feature');
    features.forEach((feature, index) => {
        feature.style.animationDelay = `${0.5 + (index * 0.1)}s`;
    });
    
    // Floating shakllar animatsiyasi
    const shapes = document.querySelectorAll('.floating-shape');
    shapes.forEach((shape, index) => {
        const delay = index * 2;
        shape.style.animation = `float 6s ease-in-out ${delay}s infinite`;
    });
}

// RAQAM FORMATLASH FUNKSIYASI
function formatWithCommas(x) {
    if (!x) return '0';
    
    const parts = x.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return parts.length > 1 ? parts.join('.') : parts[0];
}

// XATOLARNI QAYTA ISHLASH
window.addEventListener('error', function(e) {
    console.error('Xatolik yuz berdi:', e.error);
    
    // Foydalanuvchiga xabar
    if (e.error && e.error.message) {
        const errorMsg = e.error.message;
        if (errorMsg.includes('QuotaExceededError')) {
            alert("LocalStorage sig'imi tugadi. Tarixni tozalang yoki ba'zi ma'lumotlarni o'chiring.");
        }
    }
});

// OFFLINE HOLATNI QO'LLAB-QUVVATLASH
window.addEventListener('offline', function() {
    const notification = document.createElement('div');
    notification.className = 'offline-notification';
    notification.innerHTML = `
        <i class="fas fa-wifi-slash"></i>
        <span>Internet ulanmagan. Ba'zi funksiyalar ishlamasligi mumkin.</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
});

// PRINT TAYYORLASH
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        alert("Ushbu sahifani chop etish uchun brauzerning chop etish funksiyasidan foydalaning.");
    }
});

// RESPONSIVE DESIGN UCHUN
function checkScreenSize() {
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth < 768;
    
    // Mobil qurilmalar uchun optimallashtirish
    if (isMobile) {
        document.body.classList.add('mobile-view');
    } else {
        document.body.classList.remove('mobile-view');
    }
}

// Ekran o'lchami o'zgarganda tekshirish
window.addEventListener('resize', checkScreenSize);
checkScreenSize(); // Dastlabki tekshirish

// SAHIFA YUKLASH ANIMATSIYASI
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Yuklash animatsiyasini olib tashlash
    setTimeout(() => {
        const loader = document.querySelector('.page-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }
    }, 500);
});

// ============================================
// EKSPORT QILINADIGAN FUNKSIYALAR
// ============================================

// Boshqa fayllardan foydalanish uchun
window.CalculatorApp = {
    calculate: calculate,
    clearCalculator: clearCalculator,
    addToHistory: addToHistory,
    formatNumber: formatNumber,
    toggleTheme: toggleTheme,
    currentTheme: () => currentTheme
};

// ============================================
// Dastur yakunlandi
console.log('Animated Calculator v1.0 yuklandi');