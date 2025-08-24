library IEEE;
-- Other Libraries (Library Declarations)

entity ALU is
    port(
        inp_a : in STD_LOGIC_VECTOR(3 downto 0);
        inp_b : in STD_LOGIC_VECTOR(3 downto 0);
        sel : in STD_LOGIC_VECTOR(2 downto 0);
        out : in STD_LOGIC_VECTOR(3 downto 0);
    )
end ALU;

architecture behavioral of ALU is
    begin
        process(inp_a, inp_b, sel)
        begin
            case sel is
                when "000" => 
                out <= inp_a + inp_b;
                when "001" => 
                out <= inp_a - inp_b;
                when "010" => 
                out <= inp_a - 1;
                when "011" => 
                out <= inp_a + 1;
                when "100" => 
                out <= inp_a and inp_b;
                when "101" => 
                out <= inp_a or inp_b;
                when "110" => 
                out <= inp_a xor 1;
                when "111" => 
                out <= not inp_a;
                when others =>
                NULL;
            end case;
        end process;
    end behavioral;
                
