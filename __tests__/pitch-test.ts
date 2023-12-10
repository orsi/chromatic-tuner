import { ACCIDENTAL_MODE, getPitchedNote } from "../src/pitch.service";

// Note: import explicitly to use the types shipped with jest.
import {it} from '@jest/globals';

describe('pitch calculations', () => {

  it("identifies the correct note", () => {
    // sharp default
    expect(getPitchedNote(261.6).note).toBe('C');
    expect(getPitchedNote(277.18).note).toBe('C');
    expect(getPitchedNote(293.67).note).toBe('D');
    expect(getPitchedNote(311.13).note).toBe('D');
    expect(getPitchedNote(329.63).note).toBe('E');
    expect(getPitchedNote(349.23).note).toBe('F');
    expect(getPitchedNote(369.99).note).toBe('F');
    expect(getPitchedNote(392.00).note).toBe('G');
    expect(getPitchedNote(415.30).note).toBe('G');
    expect(getPitchedNote(440).note).toBe('A');
    expect(getPitchedNote(466.16).note).toBe('A');
    expect(getPitchedNote(493.88).note).toBe('B');

    // flats
    expect(getPitchedNote(261.6, ACCIDENTAL_MODE.FLAT).note).toBe('C');
    expect(getPitchedNote(277.18, ACCIDENTAL_MODE.FLAT).note).toBe('D');
    expect(getPitchedNote(293.67, ACCIDENTAL_MODE.FLAT).note).toBe('D');
    expect(getPitchedNote(311.13, ACCIDENTAL_MODE.FLAT).note).toBe('E');
    expect(getPitchedNote(329.63, ACCIDENTAL_MODE.FLAT).note).toBe('E');
    expect(getPitchedNote(349.23, ACCIDENTAL_MODE.FLAT).note).toBe('F');
    expect(getPitchedNote(369.99, ACCIDENTAL_MODE.FLAT).note).toBe('G');
    expect(getPitchedNote(392.00, ACCIDENTAL_MODE.FLAT).note).toBe('G');
    expect(getPitchedNote(415.30, ACCIDENTAL_MODE.FLAT).note).toBe('A');
    expect(getPitchedNote(440, ACCIDENTAL_MODE.FLAT).note).toBe('A');
    expect(getPitchedNote(466.16, ACCIDENTAL_MODE.FLAT).note).toBe('B');
    expect(getPitchedNote(493.88, ACCIDENTAL_MODE.FLAT).note).toBe('B');
  });

  it("identifies the correct accidental", () => {
    expect(getPitchedNote(261.6).accidental).toBe('natural');
    expect(getPitchedNote(293.67, ACCIDENTAL_MODE.FLAT).accidental).toBe('natural');
    expect(getPitchedNote(329.63).accidental).toBe('natural');
    expect(getPitchedNote(349.23, ACCIDENTAL_MODE.FLAT).accidental).toBe('natural');
    expect(getPitchedNote(392.00).accidental).toBe('natural');
    expect(getPitchedNote(440, ACCIDENTAL_MODE.FLAT).accidental).toBe('natural');
    expect(getPitchedNote(493.88).accidental).toBe('natural');
    expect(getPitchedNote(277.18).accidental).toBe('sharp');
    expect(getPitchedNote(311.13).accidental).toBe('sharp');
    expect(getPitchedNote(369.99).accidental).toBe('sharp');
    expect(getPitchedNote(415.30).accidental).toBe('sharp');
    expect(getPitchedNote(466.16).accidental).toBe('sharp');
    expect(getPitchedNote(277.18, ACCIDENTAL_MODE.FLAT).accidental).toBe('flat');
    expect(getPitchedNote(311.13, ACCIDENTAL_MODE.FLAT).accidental).toBe('flat');
    expect(getPitchedNote(369.99, ACCIDENTAL_MODE.FLAT).accidental).toBe('flat');
    expect(getPitchedNote(415.30, ACCIDENTAL_MODE.FLAT).accidental).toBe('flat');
    expect(getPitchedNote(466.16, ACCIDENTAL_MODE.FLAT).accidental).toBe('flat');
  });

  it("identifies the correct closest note", () => {
    // ~285.4 should be between C/D
    expect(getPitchedNote(285.3).note).toBe('C');
    expect(getPitchedNote(285.4).note).toBe('D');
    // ~339.3 should be between E/F
    expect(getPitchedNote(339.2).note).toBe('E');
    expect(getPitchedNote(339.3).note).toBe('F');
    // ~427.5 should be between G/A
    expect(getPitchedNote(427.4).note).toBe('G');
    expect(getPitchedNote(427.5).note).toBe('A');
  });

  it("identifies the correct closest frequency", () => {
    expect(getPitchedNote(54).frequency).toBe(55);
    expect(getPitchedNote(103).frequency).toBe(103.83);
    expect(getPitchedNote(261).frequency).toBe(261.63);
    expect(getPitchedNote(400).frequency).toBe(392);
    expect(getPitchedNote(879).frequency).toBe(880);
  });

  it("identifies the correct octave", () => {
    const a4Hz = 440;
    expect(getPitchedNote(a4Hz / 16).octave).toBe(0);
    expect(getPitchedNote(a4Hz / 8).octave).toBe(1);
    expect(getPitchedNote(a4Hz / 4).octave).toBe(2);
    expect(getPitchedNote(a4Hz / 2).octave).toBe(3);
    expect(getPitchedNote(a4Hz).octave).toBe(4);
    expect(getPitchedNote(a4Hz * 2).octave).toBe(5);
    expect(getPitchedNote(a4Hz * 4).octave).toBe(6);
    expect(getPitchedNote(a4Hz * 8).octave).toBe(7);
    expect(getPitchedNote(a4Hz * 16).octave).toBe(8);
    // e1
    expect(getPitchedNote(41.203).octave).toBe(1);
    // c4
    expect(getPitchedNote(261.626).octave).toBe(4);
    // g5
    expect(getPitchedNote(783.99).octave).toBe(5);
    // f6
    expect(getPitchedNote(1396.9).octave).toBe(6);
    // g7
    expect(getPitchedNote(3136).octave).toBe(7);
  });

  it("identifies the correct amount of cents off", () => {
    expect(getPitchedNote(390).cents).toBe(-9);
    expect(getPitchedNote(400).cents).toBe(35);
    expect(getPitchedNote(460).cents).toBe(-23);
    expect(getPitchedNote(500).cents).toBe(21);
    expect(getPitchedNote(540).cents).toBe(-45);
    expect(getPitchedNote(600).cents).toBe(37);
    expect(getPitchedNote(679).cents).toBe(-49);
    expect(getPitchedNote(700).cents).toBe(4);
    expect(getPitchedNote(720).cents).toBe(-47);
    expect(getPitchedNote(800).cents).toBe(35);
  });

});
