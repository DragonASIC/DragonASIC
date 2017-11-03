var CF = 0;
var ZF = 1;
class CPUState {
    constructor() {
        this.WorkingRegister = 0;
        this.RAM = new Array(256);
        this.ProgramMemory = new Array(65536);
        this.ProgramCounter = 0;
        this.Halt = 0;
    }
    readProgram(data) {
    }
}
function getInitialState() {
    return new CPUState();
}
function step(state) {
    return state;
}
function getStatus(state, num) {
    if (num < 8) {
        var status = state.RAM[0];
        status >>= num;
        status &= 0x1;
        return status;
    }
    else {
        throw "Status bit is out of range.";
    }
}
function setStatus(state, num) {
    if (num < 8) {
        state.RAM[0] |= (1 << num);
    }
    else {
        throw "Status bit is out of range.";
    }
}
function checkCarry(state, value) {
    if (value > 255) {
        state.WorkingRegister &= 0xFF;
        return 1;
    }
    else {
        return 0;
    }
}
function decode(state, instr) {
    var opcode = (instr >> 8) & 0x7f;
    var stylecode = (opcode >> 5) & 0x03;
    var bitcode = opcode & 0x03;
    var filecode = opcode & 0x1f;
    var imf = instr & 0xf;
    var imb = (instr >> 8) & 0x7; // Bit Address
    state.RAM[1] = state.ProgramCounter & 0xFF; // PCRL
    state.RAM[2] = (state.ProgramCounter >> 8) & 0xFF; // PCRH
    if (stylecode == 2) {
        if (bitcode == 0) {
            // console.log('BTC');
            state.RAM[imf] &= ~(0x1 << imb) && 0xFF;
        }
        else if (bitcode == 1) {
            // console.log('BTS');
            state.RAM[imf] |= (0x1 << imb) && 0xFF;
        }
    }
    else if (stylecode == 1) {
        if (filecode == 0) {
            console.log("ADD " + state.RAM[imf].toString(16));
            // W <- W + F + CF
            state.WorkingRegister = state.WorkingRegister + state.RAM[imf] + getStatus(state, CF);
            // Carry Flag
            if (checkCarry(state, state.WorkingRegister)) {
                setStatus(state, CF);
            }
        }
        else if (filecode == 1) {
            console.log("SUB " + state.RAM[imf].toString(16));
            // W <- W + F + CF
            state.WorkingRegister = state.WorkingRegister - state.RAM[imf] + getStatus(state, CF);
            // Carry Flag
            if (checkCarry(state, state.WorkingRegister)) {
                setStatus(state, CF);
            }
        }
        else if (filecode == 2) {
            console.log("MULL");
            throw "Not implemented";
        }
        else if (filecode == 3) {
            console.log("MULH");
            throw "Not implemented";
        }
        else if (filecode == 5) {
            console.log("UMULL");
            throw "Not implemented";
        }
        else if (filecode == 6) {
            console.log("UMULH");
            throw "Not implemented";
        }
        else if (filecode == 7) {
            console.log("AND " + state.RAM[imf].toString(16));
            state.WorkingRegister &= state.RAM[imf];
        }
        else if (filecode == 8) {
            console.log("OR " + state.RAM[imf].toString(16));
            state.WorkingRegister |= state.RAM[imf];
        }
        else if (filecode == 9) {
            console.log("NOT " + state.RAM[imf].toString(16));
            state.WorkingRegister = ~state.RAM[imf];
        }
        else if (filecode == 11) {
            console.log("XOR " + state.RAM[imf].toString(16));
            state.WorkingRegister ^= state.RAM[imf];
        }
        else if (filecode == 12) {
            console.log("ST " + state.RAM[imf].toString(16));
            state.RAM[imf] = state.WorkingRegister;
        }
        else if (filecode == 13) {
            console.log("LD " + state.RAM[imf].toString(16));
            state.WorkingRegister = state.RAM[imf];
        }
        else if (filecode == 14) {
            console.log("LDL " + state.RAM[imf].toString(16));
            state.WorkingRegister = imf;
        }
        else {
            throw "Not implemented";
        }
    }
    else if (stylecode == 0) {
        if (filecode == 0) {
            console.log("NOP");
            // self.halt = 1
        }
        else if (filecode == 1) {
            console.log("HALT");
            state.Halt = 1;
        }
        else if (filecode == 5) {
            console.log("SKZ");
            if (getStatus(state, ZF)) {
                state.ProgramCounter += 1;
            }
        }
        else if (filecode == 6) {
            console.log("SKC");
            if (getStatus(state, CF)) {
                state.ProgramCounter += 1;
            }
        }
        else {
            throw "Not implemented";
        }
    }
    else {
        throw "Not implemented";
    }
    // Zero Flag
    if ((state.WorkingRegister & 0xFF) == 0) {
        setStatus(state, ZF);
    }
    // JUMP
    if ((state.ProgramCounter & 0xFF) != state.RAM[1]) {
        state.ProgramCounter = (state.RAM[2] << 8) + state.RAM[1]; // PCの更新(PCRH << 8) + PCRL
    }
    console.log("--status: " + state.RAM[0].toString(2));
}
//# sourceMappingURL=simulator.js.map