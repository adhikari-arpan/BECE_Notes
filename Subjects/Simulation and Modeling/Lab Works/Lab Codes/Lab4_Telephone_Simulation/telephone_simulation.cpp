#include<iostream>
using namespace std;

int arrival(){}

int main(){
    // Variables to keep track of the simulation
    int nLines, maxLinks;
    double interArrivalTime, meanLength, stopTime;

    cout << "Telephone Call Simulation System\n";
    cout << "Enter number of lines: ";
    cin >> nLines;
    cout << "Enter maximum number of links: ";
    cin >> maxLinks;
    cout << "Enter mean inter-arrival time (seconds): ";
    cin >> interArrivalTime;
    cout << "Enter mean call length (seconds): ";
    cin >> meanLength;
    cout << "Enter stop time (minutes): ";
    cin >> stopTime;

    if (nLines < 2 * maxLinks + 2) {
        cout << "Too few lines specified. Simulation abandoned.\n";
        return 0;
    }


    cout << "\nSimulation of Telephone System - Model 1\n";
    cout << "\nNumber of lines: " << nLines;
    cout << "\nNumber of links: " << maxLinks;
    cout << "\nMean inter-arrival time: " << interArrivalTime << " seconds";
    cout << "\nMean call length: " << meanLength << " seconds";
    cout << "\nSimulated time: " << stopTime << " minutes\n";
    


    arrival();

    return 0;
}