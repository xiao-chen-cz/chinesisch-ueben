class ChineseCharacterAPI {
    constructor() {
        this.cache = new Map(); // Local cache for performance
        this.fallbackData = this.getMinimalFallbackData(); // Backup for important characters
    }

    // Main function to fetch character data
    async getCharacterData(character) {
        // First check cache
        if (this.cache.has(character)) {
            return this.cache.get(character);
        }

        try {
            // Try primary API
            const data = await this.fetchFromPrimaryAPI(character);
            if (data) {
                this.cache.set(character, data);
                return data;
            }
        } catch (error) {
            console.warn('Primary API failed:', error);
        }

        try {
            // Try fallback API
            const data = await this.fetchFromFallbackAPI(character);
            if (data) {
                this.cache.set(character, data);
                return data;
            }
        } catch (error) {
            console.warn('Fallback API failed:', error);
        }

        // Use local fallback data
        return this.fallbackData[character] || null;
    }

    // Primary API: Chinese Character Web API
    async fetchFromPrimaryAPI(character) {
        // Note: This API might have CORS issues in browsers
        // For production, you'd need a backend proxy or use a CORS-enabled API
        const baseUrl = 'https://ccdb.hemiola.com';
        
        try {
            const response = await fetch(`${baseUrl}/characters/${encodeURIComponent(character)}`, {
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) throw new Error('Character data not found');

            const charData = await response.json();
            return this.normalizeAPIData(character, charData);
        } catch (error) {
            console.error('Primary API error:', error);
            throw error;
        }
    }

    // Fallback: Extended local database
    async fetchFromFallbackAPI(character) {
        const extendedData = {
            "山": {
                character: "山", pinyin: "shān", tone: 1,
                meaning_de: "Berg", meaning_en: "mountain",
                strokes: 3, hsk_level: 1,
                words: [
                    {word: "山水", pinyin: "shānshuǐ", meaning_de: "Landschaft"},
                    {word: "高山", pinyin: "gāoshān", meaning_de: "hoher Berg"},
                    {word: "山顶", pinyin: "shāndǐng", meaning_de: "Berggipfel"},
                    {word: "山脉", pinyin: "shānmài", meaning_de: "Gebirgskette"},
                    {word: "登山", pinyin: "dēngshān", meaning_de: "Bergsteigen"},
                    {word: "火山", pinyin: "huǒshān", meaning_de: "Vulkan"}
                ]
            },
            "木": {
                character: "木", pinyin: "mù", tone: 4,
                meaning_de: "Holz, Baum", meaning_en: "wood, tree",
                strokes: 4, hsk_level: 1,
                words: [
                    {word: "树木", pinyin: "shùmù", meaning_de: "Bäume"},
                    {word: "木头", pinyin: "mùtóu", meaning_de: "Holz"},
                    {word: "木材", pinyin: "mùcái", meaning_de: "Bauholz"},
                    {word: "木工", pinyin: "mùgōng", meaning_de: "Tischler"},
                    {word: "木屋", pinyin: "mùwū", meaning_de: "Holzhaus"},
                    {word: "木桌", pinyin: "mùzhuō", meaning_de: "Holztisch"}
                ]
            },
            "土": {
                character: "土", pinyin: "tǔ", tone: 3,
                meaning_de: "Erde, Boden", meaning_en: "earth, soil",
                strokes: 3, hsk_level: 1,
                words: [
                    {word: "土地", pinyin: "tǔdì", meaning_de: "Land, Boden"},
                    {word: "泥土", pinyin: "nítǔ", meaning_de: "Schlamm, Lehm"},
                    {word: "土豆", pinyin: "tǔdòu", meaning_de: "Kartoffel"},
                    {word: "本土", pinyin: "běntǔ", meaning_de: "heimisch"},
                    {word: "领土", pinyin: "lǐngtǔ", meaning_de: "Territorium"},
                    {word: "土壤", pinyin: "tǔrǎng", meaning_de: "Erdreich"}
                ]
            },
            "金": {
                character: "金", pinyin: "jīn", tone: 1,
                meaning_de: "Gold, Metall", meaning_en: "gold, metal",
                strokes: 8, hsk_level: 1,
                words: [
                    {word: "金子", pinyin: "jīnzi", meaning_de: "Gold"},
                    {word: "金钱", pinyin: "jīnqián", meaning_de: "Geld"},
                    {word: "金属", pinyin: "jīnshǔ", meaning_de: "Metall"},
                    {word: "金牌", pinyin: "jīnpái", meaning_de: "Goldmedaille"},
                    {word: "现金", pinyin: "xiànjīn", meaning_de: "Bargeld"},
                    {word: "黄金", pinyin: "huángjīn", meaning_de: "Gold"}
                ]
            },
            "车": {
                character: "车", pinyin: "chē", tone: 1,
                meaning_de: "Fahrzeug, Auto", meaning_en: "vehicle, car",
                strokes: 4, hsk_level: 1,
                words: [
                    {word: "汽车", pinyin: "qìchē", meaning_de: "Auto"},
                    {word: "火车", pinyin: "huǒchē", meaning_de: "Zug"},
                    {word: "自行车", pinyin: "zìxíngchē", meaning_de: "Fahrrad"},
                    {word: "公交车", pinyin: "gōngjiāochē", meaning_de: "Bus"},
                    {word: "开车", pinyin: "kāichē", meaning_de: "Auto fahren"},
                    {word: "停车", pinyin: "tíngchē", meaning_de: "parken"}
                ]
            },
            "手": {
                character: "手", pinyin: "shǒu", tone: 3,
                meaning_de: "Hand", meaning_en: "hand",
                strokes: 4, hsk_level: 1,
                words: [
                    {word: "手机", pinyin: "shǒujī", meaning_de: "Handy"},
                    {word: "握手", pinyin: "wòshǒu", meaning_de: "Händeschütteln"},
                    {word: "手表", pinyin: "shǒubiǎo", meaning_de: "Armbanduhr"},
                    {word: "洗手", pinyin: "xǐshǒu", meaning_de: "Hände waschen"},
                    {word: "手指", pinyin: "shǒuzhǐ", meaning_de: "Finger"},
                    {word: "左手", pinyin: "zuǒshǒu", meaning_de: "linke Hand"}
                ]
            }
        };

        return extendedData[character] || null;
    }

    // Normalize API data to our format
    normalizeAPIData(character, charData) {
        return {
            character: character,
            pinyin: charData.pinyin || 'N/A',
            tone: this.extractTone(charData.pinyin),
            meaning_de: this.translateToGerman(charData.definition) || 'Bedeutung nicht verfügbar',
            meaning_en: charData.definition || 'Definition not available',
            strokes: charData.stroke_count || 0,
            hsk_level: this.estimateHSKLevel(character),
            words: this.generateExampleWords(character, charData)
        };
    }

    // Helper functions
    extractTone(pinyin) {
        if (!pinyin) return 0;
        const toneMarks = { 
            'ā': 1, 'á': 2, 'ǎ': 3, 'à': 4, 
            'ē': 1, 'é': 2, 'ě': 3, 'è': 4, 
            'ī': 1, 'í': 2, 'ǐ': 3, 'ì': 4, 
            'ō': 1, 'ó': 2, 'ǒ': 3, 'ò': 4, 
            'ū': 1, 'ú': 2, 'ǔ': 3, 'ù': 4, 
            'ü': 1, 'ǘ': 2, 'ǚ': 3, 'ǜ': 4 
        };
        
        for (const char of pinyin) {
            if (toneMarks[char]) return toneMarks[char];
        }
        return 0; // Neutral tone
    }

    translateToGerman(englishDefinition) {
        const translations = {
            'water': 'Wasser', 'fire': 'Feuer', 'mountain': 'Berg',
            'tree': 'Baum', 'person': 'Person', 'big': 'groß',
            'small': 'klein', 'sun': 'Sonne', 'moon': 'Mond',
            'earth': 'Erde', 'gold': 'Gold', 'wood': 'Holz',
            'metal': 'Metall', 'hand': 'Hand', 'car': 'Auto',
            'good': 'gut', 'learn': 'lernen', 'study': 'studieren'
        };

        if (!englishDefinition) return null;
        
        for (const [en, de] of Object.entries(translations)) {
            if (englishDefinition.toLowerCase().includes(en)) {
                return de;
            }
        }
        
        return null;
    }

    estimateHSKLevel(character) {
        const hsk1 = ['一', '二', '三', '人', '大', '小', '水', '火', '山', '木', '日', '月', '好', '学', '中', '国', '手', '车'];
        const hsk2 = ['今', '天', '年', '时', '分', '秒', '星', '期', '土', '金'];
        
        if (hsk1.includes(character)) return 1;
        if (hsk2.includes(character)) return 2;
        return 3;
    }

    generateExampleWords(character, charData) {
        // Basic example word generation
        const commonCombinations = {
            '学': [
                {word: '学生', pinyin: 'xuéshēng', meaning_de: 'Student'},
                {word: '学校', pinyin: 'xuéxiào', meaning_de: 'Schule'},
                {word: '学习', pinyin: 'xuéxí', meaning_de: 'lernen'}
            ],
            '好': [
                {word: '你好', pinyin: 'nǐhǎo', meaning_de: 'Hallo'},
                {word: '很好', pinyin: 'hěnhǎo', meaning_de: 'sehr gut'},
                {word: '好的', pinyin: 'hǎode', meaning_de: 'okay'}
            ]
        };

        return commonCombinations[character] || [
            {word: character + '子', pinyin: 'example', meaning_de: 'Beispielwort 1'},
            {word: '大' + character, pinyin: 'example', meaning_de: 'Beispielwort 2'},
            {word: character + '们', pinyin: 'example', meaning_de: 'Beispielwort 3'}
        ];
    }

    getMinimalFallbackData() {
        return {
            "学": {
                character: "学", pinyin: "xué", tone: 2,
                meaning_de: "lernen, studieren", meaning_en: "to learn, to study",
                strokes: 8, hsk_level: 1,
                words: [
                    {word: "学生", pinyin: "xuéshēng", meaning_de: "Student/Schüler"},
                    {word: "学校", pinyin: "xuéxiào", meaning_de: "Schule"},
                    {word: "学习", pinyin: "xuéxí", meaning_de: "lernen"},
                    {word: "大学", pinyin: "dàxué", meaning_de: "Universität"},
                    {word: "数学", pinyin: "shùxué", meaning_de: "Mathematik"},
                    {word: "科学", pinyin: "kēxué", meaning_de: "Wissenschaft"}
                ]
            },
            "好": {
                character: "好", pinyin: "hǎo", tone: 3,
                meaning_de: "gut, schön", meaning_en: "good, well",
                strokes: 6, hsk_level: 1,
                words: [
                    {word: "你好", pinyin: "nǐhǎo", meaning_de: "Hallo"},
                    {word: "好的", pinyin: "hǎode", meaning_de: "okay, gut"},
                    {word: "很好", pinyin: "hěnhǎo", meaning_de: "sehr gut"},
                    {word: "好看", pinyin: "hǎokàn", meaning_de: "schön aussehen"},
                    {word: "好吃", pinyin: "hǎochī", meaning_de: "lecker"},
                    {word: "好人", pinyin: "hǎorén", meaning_de: "guter Mensch"}
                ]
            },
            "水": {
                character: "水", pinyin: "shuǐ", tone: 3,
                meaning_de: "Wasser", meaning_en: "water",
                strokes: 4, hsk_level: 1,
                words: [
                    {word: "水果", pinyin: "shuǐguǒ", meaning_de: "Obst"},
                    {word: "喝水", pinyin: "hēshuǐ", meaning_de: "Wasser trinken"},
                    {word: "热水", pinyin: "rèshuǐ", meaning_de: "heißes Wasser"},
                    {word: "冷水", pinyin: "lěngshuǐ", meaning_de: "kaltes Wasser"},
                    {word: "水平", pinyin: "shuǐpíng", meaning_de: "Niveau"},
                    {word: "开水", pinyin: "kāishuǐ", meaning_de: "gekochtes Wasser"}
                ]
            },
            "人": {
                character: "人", pinyin: "rén", tone: 2,
                meaning_de: "Person, Mensch", meaning_en: "person, human",
                strokes: 2, hsk_level: 1,
                words: [
                    {word: "人们", pinyin: "rénmen", meaning_de: "Menschen, Leute"},
                    {word: "工人", pinyin: "gōngrén", meaning_de: "Arbeiter"},
                    {word: "大人", pinyin: "dàrén", meaning_de: "Erwachsener"},
                    {word: "个人", pinyin: "gèrén", meaning_de: "Person, individuell"},
                    {word: "人口", pinyin: "rénkǒu", meaning_de: "Bevölkerung"},
                    {word: "人民", pinyin: "rénmín", meaning_de: "Volk, Menschen"}
                ]
            },
            "日": {
                character: "日", pinyin: "rì", tone: 4,
                meaning_de: "Sonne, Tag", meaning_en: "sun, day",
                strokes: 4, hsk_level: 1,
                words: [
                    {word: "日本", pinyin: "Rìběn", meaning_de: "Japan"},
                    {word: "生日", pinyin: "shēngrì", meaning_de: "Geburtstag"},
                    {word: "日记", pinyin: "rìjì", meaning_de: "Tagebuch"},
                    {word: "今日", pinyin: "jīnrì", meaning_de: "heute"},
                    {word: "昨日", pinyin: "zuórì", meaning_de: "gestern"},
                    {word: "日出", pinyin: "rìchū", meaning_de: "Sonnenaufgang"}
                ]
            },
            "月": {
                character: "月", pinyin: "yuè", tone: 4,
                meaning_de: "Mond, Monat", meaning_en: "moon, month",
                strokes: 4, hsk_level: 1,
                words: [
                    {word: "月份", pinyin: "yuèfèn", meaning_de: "Monat"},
                    {word: "月亮", pinyin: "yuèliang", meaning_de: "Mond"},
                    {word: "一月", pinyin: "yīyuè", meaning_de: "Januar"},
                    {word: "上月", pinyin: "shàng yuè", meaning_de: "letzter Monat"},
                    {word: "下月", pinyin: "xià yuè", meaning_de: "nächster Monat"},
                    {word: "月光", pinyin: "yuèguāng", meaning_de: "Mondlicht"}
                ]
            },
            "火": {
                character: "火", pinyin: "huǒ", tone: 3,
                meaning_de: "Feuer", meaning_en: "fire",
                strokes: 4, hsk_level: 1,
                words: [
                    {word: "火车", pinyin: "huǒchē", meaning_de: "Zug"},
                    {word: "火山", pinyin: "huǒshān", meaning_de: "Vulkan"},
                    {word: "火柴", pinyin: "huǒchái", meaning_de: "Streichholz"},
                    {word: "火灾", pinyin: "huǒzāi", meaning_de: "Brand, Feuer"},
                    {word: "生火", pinyin: "shēnghuǒ", meaning_de: "Feuer machen"},
                    {word: "火锅", pinyin: "huǒguō", meaning_de: "Feuertopf, Hotpot"}
                ]
            },
            "一": {
                character: "一", pinyin: "yī", tone: 1,
                meaning_de: "eins", meaning_en: "one",
                strokes: 1, hsk_level: 1,
                words: [
                    {word: "一个", pinyin: "yīgè", meaning_de: "ein/eine"},
                    {word: "一天", pinyin: "yītiān", meaning_de: "ein Tag"},
                    {word: "一年", pinyin: "yīnián", meaning_de: "ein Jahr"},
                    {word: "一起", pinyin: "yīqǐ", meaning_de: "zusammen"},
                    {word: "一些", pinyin: "yīxiē", meaning_de: "einige"},
                    {word: "一定", pinyin: "yīdìng", meaning_de: "bestimmt"}
                ]
            },
            "大": {
                character: "大", pinyin: "dà", tone: 4,
                meaning_de: "groß", meaning_en: "big, large",
                strokes: 3, hsk_level: 1,
                words: [
                    {word: "大学", pinyin: "dàxué", meaning_de: "Universität"},
                    {word: "大家", pinyin: "dàjiā", meaning_de: "alle, jeder"},
                    {word: "大人", pinyin: "dàrén", meaning_de: "Erwachsener"},
                    {word: "大小", pinyin: "dàxiǎo", meaning_de: "Größe"},
                    {word: "很大", pinyin: "hěn dà", meaning_de: "sehr groß"},
                    {word: "长大", pinyin: "zhǎngdà", meaning_de: "aufwachsen"}
                ]
            },
            "小": {
                character: "小", pinyin: "xiǎo", tone: 3,
                meaning_de: "klein", meaning_en: "small, little",
                strokes: 3, hsk_level: 1,
                words: [
                    {word: "小孩", pinyin: "xiǎohái", meaning_de: "Kind"},
                    {word: "小学", pinyin: "xiǎoxué", meaning_de: "Grundschule"},
                    {word: "小时", pinyin: "xiǎoshí", meaning_de: "Stunde"},
                    {word: "小心", pinyin: "xiǎoxīn", meaning_de: "aufpassen"},
                    {word: "很小", pinyin: "hěn xiǎo", meaning_de: "sehr klein"},
                    {word: "小姐", pinyin: "xiǎojiě", meaning_de: "Fräulein"}
                ]
            },
            "中": {
                character: "中", pinyin: "zhōng", tone: 1,
                meaning_de: "Mitte, in", meaning_en: "middle, center, in",
                strokes: 4, hsk_level: 1,
                words: [
                    {word: "中国", pinyin: "Zhōngguó", meaning_de: "China"},
                    {word: "中文", pinyin: "zhōngwén", meaning_de: "Chinesisch"},
                    {word: "中间", pinyin: "zhōngjiān", meaning_de: "zwischen, Mitte"},
                    {word: "中午", pinyin: "zhōngwǔ", meaning_de: "Mittag"},
                    {word: "中心", pinyin: "zhōngxīn", meaning_de: "Zentrum"},
                    {word: "中学", pinyin: "zhōngxué", meaning_de: "Mittelschule"}
                ]
            }
        };
    }
}

// Main application logic with API integration
const api = new ChineseCharacterAPI();

// Event Listeners
document.getElementById('generateBtn').addEventListener('click', generateWorksheet);
document.getElementById('printBtn').addEventListener('click', () => window.print());
document.getElementById('charInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') generateWorksheet();
});

async function generateWorksheet() {
    const input = document.getElementById('charInput').value.trim();
    
    if (!input) {
        showError('Bitte geben Sie ein Zeichen ein.');
        return;
    }

    // Show loading indicator
    showLoading('Zeichen wird geladen...');
    
    try {
        const data = await api.getCharacterData(input);
        
        if (!data) {
            showError(`Keine Daten für Zeichen "${input}" gefunden.`);
            return;
        }

        hideError();
        displayWorksheet(data);
        
    } catch (error) {
        console.error('Error generating worksheet:', error);
        showError('Fehler beim Laden der Zeichendaten. Bitte versuchen Sie es erneut.');
    }
}

function displayWorksheet(data) {
    // Display character info
    document.getElementById('charDisplay').textContent = data.character;
    document.getElementById('pinyinDisplay').textContent = data.pinyin;
    document.getElementById('meaningDe').textContent = data.meaning_de;
    document.getElementById('meaningEn').textContent = data.meaning_en;
    document.getElementById('strokeCount').textContent = `${data.strokes} Striche`;
    document.getElementById('hskLevel').textContent = `HSK ${data.hsk_level}`;
    
    // Generate practice grid
    generatePracticeGrid(data.character);
    
    // Generate words list
    generateWordsList(data.words);
    
    // Show worksheet and PDF button
    document.getElementById('worksheet').classList.remove('hidden');
    document.getElementById('printBtn').classList.remove('hidden');
}

function generatePracticeGrid(character) {
    const grid = document.getElementById('practiceGrid');
    grid.innerHTML = '';
    
    for (let i = 0; i < 20; i++) {
        const cell = document.createElement('div');
        cell.className = 'practice-cell';
        
        if (i === 0) {
            cell.textContent = character;
            cell.classList.add('reference');
        } else if (i <= 3) {
            cell.textContent = character;
            cell.classList.add(`fade-${i}`);
        }
        
        grid.appendChild(cell);
    }
}

function generateWordsList(words) {
    const wordsGrid = document.getElementById('wordsGrid');
    wordsGrid.innerHTML = '';
    
    words.forEach(word => {
        const card = document.createElement('div');
        card.className = 'word-card';
        card.innerHTML = `
            <div class="word-chinese">${word.word}</div>
            <div class="word-pinyin">${word.pinyin}</div>
            <div class="word-meaning">${word.meaning_de}</div>
        `;
        wordsGrid.appendChild(card);
    });
}

function showLoading(message) {
    const error = document.getElementById('errorMsg');
    error.textContent = message;
    error.className = 'error loading';
    error.classList.remove('hidden');
}

function showError(message) {
    const error = document.getElementById('errorMsg');
    error.textContent = message;
    error.className = 'error';
    error.classList.remove('hidden');
}

function hideError() {
    document.getElementById('errorMsg').classList.add('hidden');
}

// Auto-focus on input
document.getElementById('charInput').focus();