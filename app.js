// Make Me a Hanzi integration (for GitHub Pages / offline use)
let MMH_DICT = null;
let MMH_READY = false;

async function loadMMHDictionary() {
  if (MMH_READY) return;
  const url = 'https://raw.githubusercontent.com/skishore/makemeahanzi/master/data/dictionary.txt';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Konnte dictionary.txt nicht laden');
  const text = await response.text();
  MMH_DICT = {};

  text.split('\n').forEach(line => {
    if (!line || !line.includes('\t')) return;
    const [zi, pinyin, definition] = line.split('\t').map(t => t.trim());
    if (!zi || !pinyin || !definition) return;
    MMH_DICT[zi] = { pinyin, definition };
  });

  MMH_READY = true;
}

class ChineseCharacterAPI {
    constructor() {
        this.cache = new Map();
        this.fallbackData = this.getMinimalFallbackData();
    }

    async getCharacterData(character) {
        if (this.cache.has(character)) {
            return this.cache.get(character);
        }

        // Always use Make Me a Hanzi as primary source if loaded
        if (!MMH_READY) await loadMMHDictionary();
        if (MMH_READY && MMH_DICT[character]) {
            const entry = MMH_DICT[character];
            const data = {
                character,
                pinyin: entry.pinyin,
                tone: this.extractTone(entry.pinyin),
                meaning_de: this.translateToGerman(entry.definition) || entry.definition,
                meaning_en: entry.definition,
                strokes: 0,
                hsk_level: this.estimateHSKLevel(character),
                words: this.generateExampleWords(character, entry)
            };
            this.cache.set(character, data);
            return data;
        }

        // fallback DB
        return this.fallbackData[character] || null;
    }

    extractTone(pinyin) {
        if (!pinyin) return 0;
        const toneMarks = { 'ā': 1, 'á': 2, 'ǎ': 3, 'à': 4, 'ē': 1, 'é': 2, 'ě': 3, 'è': 4, 'ī': 1, 'í': 2, 'ǐ': 3, 'ì': 4, 'ō': 1, 'ó': 2, 'ǒ': 3, 'ò': 4, 'ū': 1, 'ú': 2, 'ǔ': 3, 'ù': 4, 'ü': 1, 'ǘ': 2, 'ǚ': 3, 'ǜ': 4 };
        for (const char of pinyin) {
            if (toneMarks[char]) return toneMarks[char];
        }
        return 0; // Neutraler Ton
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
        const hsk1 = ['一', '二', '三', '人', '大', '小', '水', '火', '山', '木', '日', '月', '好', '学', '中', '国'];
        return hsk1.includes(character) ? 1 : 2;
    }

    generateExampleWords(character, entry) {
        // Fallback dummy examples, or customize for special cases
        if (character === "学") return [
            { word: "学生", pinyin: "xuéshēng", meaning_de: "Student" },
            { word: "学校", pinyin: "xuéxiào", meaning_de: "Schule" },
            { word: "学习", pinyin: "xuéxí", meaning_de: "lernen" },
        ];
        if (character === "好") return [
            { word: "你好", pinyin: "nǐhǎo", meaning_de: "Hallo" },
            { word: "好的", pinyin: "hǎode", meaning_de: "okay, gut" },
            { word: "很好", pinyin: "hěnhǎo", meaning_de: "sehr gut" }
        ];
        // Otherwise generate placeholder words
        return [
            { word: character + "子", pinyin: '', meaning_de: 'Beispielwort 1' },
            { word: "大" + character, pinyin: '', meaning_de: 'Beispielwort 2' },
            { word: character + "们", pinyin: '', meaning_de: 'Beispielwort 3' }
        ];
    }

    getMinimalFallbackData() {
        return {
            "学": {
                character: "学", pinyin: "xué", tone: 2,
                meaning_de: "lernen, studieren", meaning_en: "to learn, to study",
                strokes: 8, hsk_level: 1,
                words: [
                    { word: "学生", pinyin: "xuéshēng", meaning_de: "Student" },
                    { word: "学校", pinyin: "xuéxiào", meaning_de: "Schule" }
                ]
            },
            "好": {
                character: "好", pinyin: "hǎo", tone: 3,
                meaning_de: "gut, schön", meaning_en: "good",
                strokes: 6, hsk_level: 1,
                words: [
                    { word: "你好", pinyin: "nǐhǎo", meaning_de: "Hallo" },
                    { word: "很好", pinyin: "hěnhǎo", meaning_de: "sehr gut" }
                ]
            },
        };
    }
}

//------------------- APP CORE LOGIC -------------------

const api = new ChineseCharacterAPI();

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
        console.error(error);
        showError('Fehler beim Laden der Daten.');
    }
}

function displayWorksheet(data) {
    document.getElementById('charDisplay').textContent = data.character;
    document.getElementById('pinyinDisplay').textContent = data.pinyin;
    document.getElementById('meaningDe').textContent = data.meaning_de;
    document.getElementById('meaningEn').textContent = data.meaning_en;
    document.getElementById('strokeCount').textContent = `${data.strokes||'?'} Striche`;
    document.getElementById('hskLevel').textContent = `HSK ${data.hsk_level}`;
    generatePracticeGrid(data.character);
    generateWordsList(data.words);
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

document.getElementById('charInput').focus();
loadMMHDictionary();
