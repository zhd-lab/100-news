const loadKeywords = async (filename) => {
    try {
        const response = await fetch(filename);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}`);
        }
        const data = await response.json();
        return data.keywords || [];
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return [];
    }
};

const loadAllKeywords = async () => {
    const eco = await loadKeywords('./configsParsing/eco.json');
    const poli = await loadKeywords('./configsParsing/poli.json');
    const war = await loadKeywords('./configsParsing/war.json');
    return [...eco, ...poli, ...war];
};

export async function ParsingEntry(str) {
    console.log('entrée:\n' + str);

    if (typeof str !== "string") {
        throw new Error("Input must be a string");
    }
    
    const allKeywords = await loadAllKeywords();
    const words = str.split(/\s+/);
    const foundKeywords = words.filter(word => allKeywords.includes(word.toLowerCase()));
    
    return foundKeywords;
}
