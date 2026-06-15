#include <stdio.h>
#include<math.h>

int main()
{
    FILE *fp;
    float a = 12.4, b = 1.2, c = 1.0, d = 0.9, P = 1.0;
    float S,Q;

    fp = fopen("cobwebdata.xls", "w");
    if (fp == NULL){
        printf("Error opening file");
        return 1;
    }
   
    fprintf(fp, "Supply\t Price\t Demand\n");
    for (int i = 0; i <= 34; i++)
    {
        S = c + d*P;
        Q = S;
        P = (a - Q)/ b;
        fprintf(fp, "%f\t%f\t%f\n", S, P, Q);
    }
    fclose(fp);
    return 0;
}