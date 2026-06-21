#include<stdio.h>
#include<ctype.h>

int isIdentifier(char str[]){
    
    // If not alphabet and underscore in first, reject the string 
    if( !(isalpha(str) || str[0] == '_') ){
        return 0;
    }

    for(int i=1 ; str[i] == '\0' ; i++){
        if(!(isalnum(str[i]) || str[i] == '_' )){
            return 0;
        }
    }

    return 1;
}

int isConstant(char str[]) {
    int hasDecimal = 0;

    for (int i = 0; str[i] != '\0'; i++) {
        if (str[i] == '.') {
            if (hasDecimal)
                return 0;
            hasDecimal = 1;
        }
        else if (!isdigit(str[i])) {
            return 0;
        }
    }

    return 1;
}

int isOperator(char str[]) {
    char operators[][3] = {
        "+", "-", "*", "/", "%",
        "=", "==", "!=", "<", ">",
        "<=", ">=", "&&", "||", "!"
    };

    int n = sizeof(operators) / sizeof(operators[0]);

    for (int i = 0; i < n; i++) {
        if (strcmp(str, operators[i]) == 0)
            return 1;
    }

    return 0;
}

int main() {
    char str[50];

    printf("Enter a token: ");
    scanf("%s", str);

    if (isIdentifier(str))
        printf("%s is an Identifier\n", str);
    else if (isConstant(str))
        printf("%s is a Constant\n", str);
    else if (isOperator(str))
        printf("%s is an Operator\n", str);
    else
        printf("%s is Invalid\n", str);

    return 0;
}
