library IEEE;
 -- Other libraries (Library Section)

entity mux is 
port(
    A: in STD_LOGIC; 
    B: in STD_LOGIC;
    C: in STD_LOGIC; 
    D: in STD_LOGIC;
    S0: in STD_LOGIC;
    S1: in STD_LOGIC;
    E: in STD_LOGIC);
end mux;

architecture behavioral of mux is
    begin
        process (A, B, C, D, S0, S1)
        begin
        if(S0 = "0" and S1 = "0") then
            E <= A;
        elsif (S0 = "0" and S1 = "1") then
            E <= B;
        elsif (S0 = "0" and S1 = "1") then
            E <= C;
        else
            E <= D;
        end if;
        end process;
    end behavioral;
