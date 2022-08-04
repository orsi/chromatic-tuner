
export enum ACCIDENTAL_MODE {
    SHARP,
    FLAT
}
export type TBaseNote = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g';
export type TAccidental = "natural" | "sharp" | "flat";
export type TAccidentedNote = {
    note: TBaseNote;
    accidental: TAccidental;
};
export type TNote = {
    notes: TAccidentedNote[];
};
const A_FREQUENCY = 440;

export interface IPitchedNote {
    accidental: TAccidental;
    cents: number;
    note: string;
    frequency: number;
    octave: number;
}

export const getAccidentNote = (semitones: number, mode = ACCIDENTAL_MODE.SHARP) => {
    const stepsAway = Math.round(semitones);
    const steps = stepsAway < 0 ? 12 + stepsAway % 12 : stepsAway % 12;

    let accidental: TAccidental = 'natural';
    let note = 'A';
    switch (steps) {
        case 0: {
            note = 'A';
            break;
        };
        case 1: {
            note = mode === ACCIDENTAL_MODE.SHARP ? 'A' : 'B';
            accidental = mode === ACCIDENTAL_MODE.SHARP ? 'sharp' : 'flat';
            break;
        };
        case 2: {
            note = 'B';
            break;
        };
        case 3: {
            note = 'C';
            break;
        };
        case 4: {
            note = mode === ACCIDENTAL_MODE.SHARP ? 'C' : 'D';
            accidental = mode === ACCIDENTAL_MODE.SHARP ? 'sharp' : 'flat';
            break;
        };
        case 5: {
            note = 'D';
            break;
        };
        case 6: {
            note = mode === ACCIDENTAL_MODE.SHARP ? 'D' : 'E';
            accidental = mode === ACCIDENTAL_MODE.SHARP ? 'sharp' : 'flat';
            break;
        };
        case 7: {
            note = 'E';
            break;
        };
        case 8: {
            note = 'F';
            break;
        };
        case 9: {
            note = mode === ACCIDENTAL_MODE.SHARP ? 'F' : 'G';
            accidental = mode === ACCIDENTAL_MODE.SHARP ? 'sharp' : 'flat';
            break;
        };
        case 10: {
            note = 'G';
            break;
        };
        case 11: {
            note = mode === ACCIDENTAL_MODE.SHARP ? 'G' : 'A';
            accidental = mode === ACCIDENTAL_MODE.SHARP ? 'sharp' : 'flat';
            break;
        };
    }
    return { accidental, note };
};

/**
 * 
 * @param frequency Frequency of a pitch
 * @param mode Determines whether the returned note will show sharps or flats
 * @returns 
 */
export const getPitchedNote = (frequency: number, mode = ACCIDENTAL_MODE.SHARP): IPitchedNote => {
    const octave = Math.log2(frequency / A_FREQUENCY);
    const semitones = 12 * octave;
    const closestFrequency = A_FREQUENCY * Math.pow(2, Math.round(semitones) * 100 / 1200);
    const roundedFrequency = Math.round(closestFrequency * 100) / 100;
    const { accidental, note } = getAccidentNote(semitones, mode)
    const cents = Math.round(1200 * Math.log2(frequency / roundedFrequency));
    const pitchedNote: IPitchedNote = {
        accidental: accidental,
        cents: cents,
        frequency: roundedFrequency,
        note: note,
        octave: Math.ceil(octave + 4),
    };
    return pitchedNote;
};