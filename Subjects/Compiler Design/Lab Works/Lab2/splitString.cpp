/* WAP to split a string 
"int main() {char a; printf("Good Morning"); a='A'; printf("%c", a); return 0}"
into tokens. 

int - Keyword
main - Keyword
char - Keyword
a - Identifier
printf - Keyword
'Good Morning' - Constant
= - Operator
*/

#include <iostream>
#include <string>
#include <set>
using namespace std;

set<string> keywords = {"int", "char", "float", "return", "void",
                        "if", "else", "while", "for", "main",
                        "printf", "scanf", "double"};

string classify(string token) {
    if (keywords.count(token))   return "Keyword";
    if (token[0] == '"' || token[0] == '\'') return "Constant";
    if (token == "=" || token == "+" || token == "-" ||
        token == "*" || token == "/") return "Operator";
    if (isalpha(token[0])) return "Identifier";
    if (isdigit(token[0])) return "Constant";
    return "Punctuation";
}

int main() {
    string code = "int main() {char a; printf(\"Good Morning\"); a='A'; printf(\"%c\", a); return 0}";

    cout << "TOKEN\t\t\tTYPE\n";
    cout << string(35, '-') << "\n";

    int i = 0, n = code.size();
    while (i < n) {
        if (isspace(code[i])) { i++; continue; }

        // String constant
        if (code[i] == '"') {
            int j = i + 1;
            while (j < n && code[j] != '"') j++;
            string tok = code.substr(i, j - i + 1);
            cout << tok << "\t\t" << classify(tok) << "\n";
            i = j + 1; continue;
        }

        // Char constant
        if (code[i] == '\'') {
            int j = i + 1;
            while (j < n && code[j] != '\'') j++;
            string tok = code.substr(i, j - i + 1);
            cout << tok << "\t\t" << classify(tok) << "\n";
            i = j + 1; continue;
        }

        // Word (keyword or identifier)
        if (isalpha(code[i])) {
            int j = i;
            while (j < n && isalnum(code[j])) j++;
            string tok = code.substr(i, j - i);
            cout << tok << "\t\t" << classify(tok) << "\n";
            i = j; continue;
        }

        // Number
        if (isdigit(code[i])) {
            int j = i;
            while (j < n && isdigit(code[j])) j++;
            string tok = code.substr(i, j - i);
            cout << tok << "\t\t" << "Constant\n";
            i = j; continue;
        }

        // Operator or punctuation
        string tok(1, code[i]);
        cout << tok << "\t\t" << classify(tok) << "\n";
        i++;
    }

    return 0;
}