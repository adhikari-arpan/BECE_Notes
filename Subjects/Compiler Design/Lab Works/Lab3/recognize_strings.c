#include<stdio.h>
#include<string.h>

int main(){
    char str[100];
    int len, i;

    printf("Enter a string: ");
    scanf("%s", str);

    len = strlen(str);

    // Check for a*
    int a_star = 1; // Assume it's a* until proven otherwise
    for(i=0; i<len; i++){
        if(str[i] != 'a'){
            a_star = 0; // Not a*
            break;
        }
    }

    // Check for a*b+
    int a_star_b_plus = 1; // Assume it's a*b+ until proven otherwise
    
    while(i<len && str[i] == 'a'){
        i++;
    }

    int b_count = 0; // Count of 'b's
    while(i<len && str[i] == 'b'){
        b_count++;
        i++;
    }

    if(i!=len || b_count == 0){ // If a and b only exista, then i == len
        a_star_b_plus = 0;
    }

    // Check for abb
    int a_b_b = (strcmp(str, "abb") == 0); // If match found, strcmp returns 0

    printf("********************\nResults:\n");
    if(a_star)
        printf("String belongs to a*\n");
    else
        printf("String does not belong to a*\n");

    if(a_star_b_plus)
        printf("String belongs to a*b+\n");
    else
        printf("String does not belong to a*b+\n");

    if(a_b_b)
        printf("String belongs to abb\n");
    else
        printf("String does not belong to abb\n");

    return 0;
}
