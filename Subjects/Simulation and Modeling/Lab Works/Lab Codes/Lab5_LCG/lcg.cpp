#include<iostream>
#include<cmath>
#include<algorithm>
using namespace std;

int main(){
    float a = 7.0, c = 3.0, m = 16.0;
    float u;
    float z[17];
    z[0] = 7.0;

    cout << "i\tz\tu" << endl;
    for (int i = 0; i < m; i++) {
        z[i+1] = fmod((a * z[i] + c), m);
        u = z[i+1] / m;
        cout << i << "\t" << z[i] << "\t" << u << endl;
    }

    sort(z, z + 16);
    
    int count = 0;
    for (int i = 0; i < 16; i++) {
        if(z[i] == z[i+1]){
            count++;
        }
    }
    cout << "Number of repeated numbers: " << count << endl;

    return 0;
}