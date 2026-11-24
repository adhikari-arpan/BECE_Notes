#include<stdio.h>
int main(){
    float a=12.4,b=1.2,c=1.0,d=0.9;
    float p[10];
    float Q[10];//= a-bp
    float S[10];//c+dp
    float initial_price = 1.0;
    // p[0] = 1.0;
    for(int i=0;i<=10;i++){
        S[i] = c+d*initial_price;
        Q[i] = S[i];
        p[i] = (a-Q[i])/b;
        initial_price = p[i];
        printf("S[%d] = %f\n",i,S[i]);
        printf("Q[%d] = %f\n",i,Q[i]);
        printf("P[%d] = %f\n",i,p[i]);
    }
    return 0;
}