# 🔷 1. Overall Architecture Type

It follows **Harvard Architecture**:

* Separate **Program Memory (Flash)**
* Separate **Data Memory (SRAM, EEPROM)**
* 8-bit **Data Bus**

This increases speed because instruction and data can be accessed simultaneously.

---

# 🔷 2. Program Memory Section (Left Side)

### 🟦 Flash Program Memory

* Stores the program (machine code).
* Non-volatile (does not erase when power is off).

### 🟦 Program Counter (PC)

* Holds the address of the next instruction.
* Automatically increments after each instruction.

### 🟦 Instruction Register

* Holds the current instruction fetched from memory.

### 🟦 Instruction Decoder

* Decodes instruction.
* Generates control signals for execution.

👉 Flow:

```
Flash → PC → Instruction Register → Decoder → Control Signals
```

---

# 🔷 3. CPU Core (Center Section)

### 🟦 32 × 8 General Purpose Registers

* 32 registers (R0–R31)
* Each 8-bit
* Used for fast data operations.
* Connected directly to ALU (very fast execution).

### 🟦 ALU (Arithmetic Logic Unit)

Performs:

* Addition
* Subtraction
* AND, OR, XOR
* Shift operations
* Compare

After operation:

* Updates **Status & Control Register (Flags)**

---

### 🟦 Status and Control Register

Contains flags like:

* Carry
* Zero
* Negative
* Overflow
* Interrupt enable

---

# 🔷 4. Data Memory Section

### 🟦 Data SRAM

* Temporary data storage.
* Stores variables during program execution.
* Volatile memory.

### 🟦 EEPROM

* Non-volatile data memory.
* Stores permanent data (like settings).

---

# 🔷 5. Addressing Modes

Two types shown:

### ✔ Direct Addressing

* Address is directly specified.

### ✔ Indirect Addressing

* Address is stored inside a register.
* More flexible.

---

# 🔷 6. Peripheral Units (Right Side)

Connected through 8-bit Data Bus:

* **Interrupt Unit** → Handles interrupts
* **SPI Unit** → Serial communication
* **Watchdog Timer** → Resets system if stuck
* **Analog Comparator** → Compare analog signals
* **I/O Modules** → Control input/output pins
* **I/O Lines** → Physical microcontroller pins

---

# 🔷 7. Data Bus (8-bit)

* Transfers data between:

  * CPU
  * Memory
  * Peripherals
* 8-bit wide → processes 8 bits at a time

---

# 🔷 How Everything Works (Step-by-Step)

1. PC fetches instruction from Flash.
2. Instruction stored in Instruction Register.
3. Decoder decodes it.
4. ALU performs operation using registers.
5. Result stored in register or SRAM.
6. Status flags updated.
7. If interrupt occurs → Interrupt Unit handles it.

---

# 🔷 Key Features (Exam Points)

* Harvard architecture
* 8-bit processor
* 32 general-purpose registers
* Separate Flash, SRAM, EEPROM
* Built-in peripherals
* Fast execution (most instructions in 1 clock cycle)
