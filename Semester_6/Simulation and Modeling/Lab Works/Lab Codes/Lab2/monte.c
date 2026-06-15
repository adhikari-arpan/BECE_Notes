#include <stdio.h>
#include <stdlib.h>
#include <math.h>
float f(float x)
{
    return sqrt(1 - x * x);
}
int main()
{
    float x, y;
    int n = 0, N;
    for (N = 1; N <= 100000; N++)
    {
        x = ((double)rand() / (RAND_MAX));
        y = ((double)rand() / (RAND_MAX));
        if (y <= f(x))
        {
            n++;
        }
    }
    printf("n=%d \n N=%d", n, N);
    float pi = 4.0 * n / N;
    printf("\nUsing monte carlo simulation value of pi = %f", pi);
    float error = (3.1415-pi)/3.1415;
    printf("\nError = %f",error);
    return 0;
}