### Two Main Design Issues in Interrupt I/O

1. **How does the processor know which device caused the interrupt?**
2. **If multiple interrupts happen at the same time, how does the processor decide which one to handle first?**

### Four Techniques for Device Identification and Interrupt Handling

1. **Multiple Interrupt Lines**
   - Each device is assigned a separate interrupt line directly connected to the processor or the interrupt controller (such as the 8259A PIC).
   - When a device wants to interrupt, it raises its specific line.
   - The processor knows which device caused the interrupt by checking which line is active.
   - **Disadvantage:** Impractical as the number of devices grows because it requires many physical interrupt lines (wires/pins).

2. **Software Polling**
   - Processor detects an interrupt and branches to an interrupt-service routine (ISR).
   - The ISR polls (checks) each I/O module in sequence by sending commands (like TEST I/O) and reading status registers to find which device caused the interrupt.
   - Once identified, the processor branches to the specific device’s handler.
   - **Disadvantage:** Time-consuming, as the processor must sequentially check all devices, causing delays especially with many devices.

3. **Daisy Chain (Hardware Polling, Vectored Interrupts)**
   - All I/O modules share a **common interrupt request line**, connected in a daisy chain.
   - When an interrupt occurs, the processor sends an **interrupt acknowledge** signal which passes through devices in the chain.
   - Each device checks if it requested the interrupt. The first device in the chain that has a request responds by sending its **interrupt vector** (a unique identifier or address) to the processor, telling it which ISR to run.
   - Devices that did not request interrupt pass the acknowledge signal down the chain.
   - This system prioritizes devices by their order in the chain (nearer devices have higher priority).
   - Known as **vectored interrupts** because the device provides a vector (address) of the ISR.
   
4. **Bus Arbitration (Vectored)**
   - An I/O module must first **gain control of the bus** before it can raise an interrupt.
   - Only one device can control the bus and raise an interrupt at a time.
   - When processor receives an interrupt, it acknowledges on an interrupt acknowledge line.
   - Among multiple interrupt lines, the processor picks the one with the **highest priority**.
   - Bus arbitration uses a bus controller or arbiter hardware that grants bus control and manages priority.
   - This ensures orderly and prioritized access and interrupts.
   
### Priority in Interrupt Handling

- In **multiple interrupt lines**, priority is often fixed by the hardware line number: lower numbered lines may have higher priority.
- With **software polling**, the order in which the processor polls devices sets their priority.
- In **hardwired daisy chain polling**, the device closer to the processor gets higher priority.
- **Bus arbitration** uses a dedicated hardware scheme to assign priorities dynamically and fairly.

### Summary:

| Technique           | How it identifies device          | Pros                  | Cons                          |
|---------------------|----------------------------------|-----------------------|-------------------------------|
| Multiple Interrupt Lines | Direct lines per device            | Simple device ID       | Expensive, impractical for many devices |
| Software Polling     | Processor checks each device sequentially | No special hardware needed | Slow, inefficient               |
| Daisy Chain         | Chain of devices passes acknowledge to find source | Hardware priority, vectored interrupt | Priority fixed by device order |
| Bus Arbitration     | Device must get bus control to interrupt | Fair, prioritized access | Requires bus arbitration hardware |

These techniques help the processor identify interrupting devices and decide which to service first, efficiently managing multiple I/O devices in complex computer systems.