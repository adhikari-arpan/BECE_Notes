#include <stdio.h>
#include <string.h>
#include <ctype.h>

int isKeyword(char str[]) {
    char keywords[][10] = {
        "int", "main", "char", "printf", "return"
    };

    for (int i = 0; i < 5; i++) {
        if (strcmp(str, keywords[i]) == 0)
            return 1;
    }

    return 0;
}

int isOperator(char ch) {
    char ops[] = "=+-*/%";

    for (int i = 0; ops[i] != '\0'; i++) {
        if (ch == ops[i])
            return 1;
    }

    return 0;
}

int main() {

    char code[] =
    "int main() {char a; printf(\"Good Morning\"); a='A'; printf(\"%c\", a); return 0;}";

    char temp[100];
    int i, j;

    for (i = 0; code[i] != '\0'; i++) {

        // String Constant
        if (code[i] == '"') {
            j = 0;
            i++;

            while (code[i] != '"') {
                temp[j++] = code[i++];
            }

            temp[j] = '\0';

            printf("\"%s\" - Constant\n", temp);
        }

        // Character Constant
        else if (code[i] == '\'') {
            j = 0;
            i++;

            while (code[i] != '\'') {
                temp[j++] = code[i++];
            }

            temp[j] = '\0';

            printf("\'%s\' - Constant\n", temp);
        }

        // Identifier or Keyword
        else if (isalpha(code[i])) {

            j = 0;

            while (isalnum(code[i]) || code[i] == '_') {
                temp[j++] = code[i++];
            }

            temp[j] = '\0';
            i--;

            if (isKeyword(temp))
                printf("%s - Keyword\n", temp);
            else
                printf("%s - Identifier\n", temp);
        }

        // Operator
        else if (isOperator(code[i])) {
            printf("%c - Operator\n", code[i]);
        }
    }

    return 0;
}