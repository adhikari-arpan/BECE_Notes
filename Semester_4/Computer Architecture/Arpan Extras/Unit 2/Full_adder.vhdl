library IEEE;
-- Other libraries (Library Declarations)

entity xor_gate is 
port (
    A: in STD_LOGIC;
    B: in STD_LOGIC;
    C: out STD_LOGIC);
end xor_gate;

architecture behavioral of xor_gate is
    begin
        C<= A xor B;
    end behavioral;

--------------------------------------------------------

-- Similarly build components for or_gate and and_gate

--------------------------------------------------------
library IEEE;
-- Other libraries (Library Declarations)

entity full_adder is
port (
    A: in STD_LOGIC;
    B: in STD_LOGIC;
    Cin: in STD_LOGIC;
    Sum: in STD_LOGIC;
    Cout: in STD_LOGIC);
end full_adder;

architecture behavioral of full_adder is

    component xor_gate is
        begin
            port (
            A: in STD_LOGIC;
            B: in STD_LOGIC;
            C: out STD_LOGIC);
        end component;
    
    -- Similary call components or_gate and and_gate

    signal s0, c1, c2: STD_LOGIC;
    begin
        U1: xor_gate port map (A, B, S0);
        U2: xor_gate port map (S0, Cin, Sum);
        U3: and_gate port map (A, B, C1);
        U4: and_gate port map (S0, Cin, C2);
        U5: or_gate port map (C1, C2, Cout);
    end Behavioral;

