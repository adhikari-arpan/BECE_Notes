# Telephone System

## 1. What is a Telephone System?

A **telephone system** is a communication network that enables the transmission of voice signals between users over long distances.

It consists of various components such as:

- **Telephone exchanges**
- **Transmission lines**
- **Switching equipment**
- **User terminals (telephones)**

The main purpose of a telephone system is to establish and maintain a communication path between two or more users.

---

## 2. Why is Hierarchy Needed in a Telephone System?

A **hierarchical structure** is used in telephone systems to efficiently manage a large number of users and telephone calls.

It helps in:

- **Efficient bandwidth utilization** by grouping multiple calls together.
- **Scalability** by allowing the network to support a growing number of users.
- **Efficient call routing** by organizing exchanges and switching systems into different levels.
- **Reliable communication** by providing a structured network.
- **Reduced congestion** by managing traffic at different levels of the network.

### Simple Hierarchy

```text
Local Exchange
      ↓
Tandem / Regional Exchange
      ↓
National Exchange
      ↓
International Exchange
```

The hierarchical structure makes it easier to manage and route calls between users located in different areas.

---

## 3. FDM in Analog Telephone Systems

**FDM (Frequency Division Multiplexing)** was widely used in traditional analog telephone systems.

In FDM, multiple voice signals are transmitted through the same communication medium by assigning each signal a **different frequency band**.

### Working of FDM

- Each telephone call is assigned a separate frequency band.
- Multiple calls can be transmitted simultaneously through the same medium.
- **Guard bands** are placed between frequency bands to prevent interference.
- It was mainly used in older **analog long-distance telephone networks**.

### Simple Representation

```text
Frequency
   ↓
| Call 1 | Guard | Call 2 | Guard | Call 3 |
```

### Advantages of FDM

- Multiple calls can be transmitted simultaneously.
- Continuous transmission is possible.
- Suitable for analog signals.

### Limitation

- Requires separate frequency bands for different channels.
- Guard bands reduce the available bandwidth.
- More difficult to manage as the number of channels increases.

---

## 4. TDM in Digital Telephone Systems

**TDM (Time Division Multiplexing)** is commonly used in digital communication systems.

In TDM, multiple digital signals share the same communication channel by using **different time slots**.

Before transmission, voice signals are converted from analog to digital form using techniques such as **Pulse Code Modulation (PCM)**.

### Working of TDM

1. The analog voice signal is converted into a digital signal.
2. The digital signals from multiple calls are divided into time slots.
3. Each call is assigned a specific time slot.
4. The signals are transmitted sequentially through the same communication channel.
5. At the receiving end, the signals are separated and reconstructed.

### Simple Representation

```text
Time →
| Call 1 | Call 2 | Call 3 | Call 1 | Call 2 | Call 3 |
```

### Advantages of TDM

- Efficient use of communication channels.
- Suitable for digital signals.
- Multiple calls can share the same transmission medium.
- Does not require guard bands like FDM.

### Applications

TDM and related digital multiplexing techniques have been used in:

- Digital telephone networks
- Mobile communication systems
- Fiber-optic communication
- Digital transmission systems
- Some VoIP infrastructure

---

# FDM vs TDM

| Feature | FDM | TDM |
|---|---|---|
| Full Form | Frequency Division Multiplexing | Time Division Multiplexing |
| Mainly Used For | Analog communication | Digital communication |
| Sharing Method | Different frequency bands | Different time slots |
| Transmission | Simultaneous | Sequential time slots |
| Guard Band | Required | Not required between frequency channels |
| Signal Type | Mainly analog | Mainly digital |
| Example | Traditional analog telephone systems | Digital telephone systems |

---

# Summary

A **telephone system** provides long-distance voice communication using exchanges, transmission lines, switching equipment, and user terminals.

A **hierarchical structure** helps organize the network, efficiently route calls, reduce congestion, and support a large number of users.

- **FDM** divides the communication channel into different **frequency bands** and was widely used in traditional analog telephone systems.
- **TDM** divides the communication channel into different **time slots** and is used in digital communication systems.

### Key Difference

> **FDM → Different frequencies**  
> **TDM → Different time slots**