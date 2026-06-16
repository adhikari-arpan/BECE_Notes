#include<stdio.h>
#include<stdlib.h>

int main(){
    float M = 2.0, K = 400.0, F = 1.0, D = 5.65;
    float acc, vel = 0.0, pos = 0.0;
    float time_interval = 0.05;
    float i;
    
    FILE *fp;
    fp = fopen("data.xls", "w+");

    fprintf(fp, "Acceleration\tVelocity\tPosition\n");
    for (i = 0; i <= 10; i+= 0.5){
        acc = 1.0/M * (K * F - D * vel - K * pos);
        vel += acc * time_interval;
        pos += vel * time_interval;
        printf("acc = %f \t", acc);
        printf("vel = %f \t", vel);
        printf("pos = %f \n", pos);
        fprintf(fp, "%f\t%f\t%f\n",acc, vel, pos);
    }
    
    fclose(fp);
    return 0;
}