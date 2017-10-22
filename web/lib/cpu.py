# -*- coding: utf-8 -*-
import numpy as np

class cpu:
    """ """

    # define
    CF = 0
    ZF = 1

    def __init__(self):
        self.prom = [0] * 65536 # プログラムメモリ
        self.ram = [0] * 256    # RAM
        self.pc = 0             # プログラムカウンタ
        self.w = 0              # ワーキングレジスタ
        self.halt = 0           # 1で動作終了


    def start(self, filepath):
        f = open(filepath, 'r', encoding='utf-8-sig')
        data = f.read()
        lines = data.split('\n')

        # プログラムメモリの読み込み
        i = 0
        for line in lines:
            self.prom[i] = int(line, 2)
            i += 1

        print('PC\tOperation\tSTATUS')

        # 命令実行(haltフラグで停止)
        while(self.halt == 0):
            print(self.pc, end='')
            print('\t', end='')
            # print(self.prom[self.pc])
            self.decode(self.prom[self.pc])
            self.pc += 1

        i = 0
        print('-----CORE DUMP-----')
        for data in self.ram:
            print(i, end='')
            print('\t', end='')
            print(data)
            i += 1

        return


    def decode(self, inst):
        # Operation Code 
        opcode = (inst >> 8) & 0x7f      # オペコード
        stylecode = (opcode >> 5) & 0x03 # 命令書式
        bitcode = opcode & 0x03          # Bit命令のオペコード下位2ビット
        filecode = opcode & 0x1f         # File Ctrl命令のオペコード下位5ビット

        # Immediate Data
        imf = inst & 0xf  # File Register Address
        imb = (inst >> 8) & 0x7 # Bit Address

        self.ram[1] = self.pc & 0xFF        # PCRL
        self.ram[2] = (self.pc >> 8) & 0xFF # PCRH

        if (stylecode == 2): # Bit Instruction
            if(bitcode == 0):   # BTC
                print("BTC", end='')
                self.ram[imf] = self.__bitClear(imb, self.ram[imf])

            elif(bitcode == 1): # BTS
                print("BTS", end='')
                self.ram[imf] = self.__bitSet(imb, self.ram[imf])

        elif (stylecode == 1): # File & Ctrl Instruction
            if(filecode == 0):   # ADD
                print("ADD " + str(hex(self.ram[imf])), end='')
                # W <- W + F + CF
                self.w = self.w + self.ram[imf] + self.__getStatus(self.CF)
                # Carry Flag
                if(self.__checkCarry(self.w)):
                    self.__setStatus(self.CF)
                
            elif(filecode == 1): # SUB
                print("SUB " + str(hex(self.ram[imf])), end='')
                # W <- W + F + CF
                self.w = self.w - self.ram[imf] + self.__getStatus(self.CF)
                # Carry Flag
                if(self.__checkCarry(self.w)):
                    self.__setStatus(self.CF)
                
            elif(filecode == 2): # MULL
                print("MULL", end='')
                # MULL

            elif(filecode == 3): # MULH
                print("MULH", end='')
                # MULH

            elif(filecode == 5): # UMULL
                print("UMULL", end='')
                # UMULL

            elif(filecode == 6): # UMULH
                print("UMULH", end='')
                # UMULH

            elif(filecode == 7): # AND
                print("AND " + str(hex(self.ram[imf])), end='')
                self.w &= self.ram[imf]

            elif(filecode == 8): # OR
                print("OR " + str(hex(self.ram[imf])), end='')
                self.w |= self.ram[imf]

            elif(filecode == 9): # NOT
                print("NOT " + str(hex(self.ram[imf])), end='')
                self.w = ~self.ram[imf]
            elif(filecode == 11): # XOR
                print("XOR " + str(hex(self.ram[imf])), end='')
                self.w ^= self.ram[imf]
            elif(filecode == 12): # ST
                print("ST " + str(hex(self.ram[imf])), end='')
                self.ram[imf] = self.w
            elif(filecode == 13): # LD
                print("LD " + str(hex(self.ram[imf])), end='')
                self.w = self.ram[imf]
            elif(filecode == 14): # LDL
                print("LDL " + str(hex(self.ram[imf])), end='')
                self.w = imf
            else:
                print("not implemented", end='')

        elif (stylecode == 0):
            if (filecode == 0): # NOP
                print("NOP", end='')
                self.halt = 1

            elif (filecode == 1): # HALT
                print("HALT", end='')
                self.halt = 1

            elif (filecode == 5): # SKZ
                print("SKZ", end='')
                if (self.__getStatus(ZF)):
                    self.pc += 1 

            elif (filecode == 6): # SKC
                print("SKC", end='')
                if (self.__getStatus(CF)):
                    self.pc += 1

            else:
                print("not implemented", end='')
        else:
            print("not implemented", end='')

        # Zero Flag
        if(self.__checkZero(self.w)):
            self.__setStatus(self.ZF)

        # JUMP
        if((self.pc & 0xFF) != self.ram[1]): # PCRLへのアクセスがあった
            self.pc = (self.ram[2] << 8) + self.ram[1] # PCの更新 (PCRH << 8) + PCRL

        print('\t\t', end='')
        print(bin(self.ram[0]))

        return


    # ステータス・レジスタのビットセット
    def __setStatus(self, num):
        if (num < 8):
            self.ram[0] |= (1 << num)
        else:
            print("error")
            self.halt = 1
        return

    # ステータス・レジスタのビットゲット
    def __getStatus(self, num):
        status = self.ram[0]
        if (num < 8):
            status >>= num
            status &= 1 
            return status
        else:
            print("error")
            self.halt = 1
            return 0


    # キャリーチェック
    def __checkCarry(self, num):
        if(num > 255):
            self.w &= 0xFF
            return 1
        else:
            return 0


    # ゼロチェック
    def __checkZero(self, num):
        if (num & 0xFF == 0):
            return 1
        else:
            return 0

    
    def __bitSet(self, bit, data):
        return (data | (1 << bit)) & 0xFF

    
    def __bitClear(self, bit, data):
        return
        

if __name__ == '__main__':
    cpu = cpu()
    f = "prom.dat"
    cpu.start(f)
