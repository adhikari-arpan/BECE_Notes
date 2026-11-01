#include <stdio.h>
#include <ctype.h>

int main() {
    FILE *fp;
    char ch;
    int characters = 0, words = 0, lines = 0;
    int inWord = 0;

    char str[100];
    printf("Enter file name to detect: ");
    scanf("%s", str);
    fp = fopen(str, "r");

    if(fp == NULL){
        printf("Error opening file \n");
        return 1;
    }

    while((ch = fgetc(fp)) != EOF){
        characters++;

        if(ch == '\n')
            lines++;

        if (isspace(ch))
            inWord = 0; //inWord is used to detect same word is not counted twice

        else if (inWord == 0) {
            inWord = 1;
            words++;
    }
    }

    fclose(fp);

    printf("Characters = %d\n", characters);
    printf("Words = %d\n", words);
    printf("Lines = %d\n", lines);

    return 0;
}