#include <iostream>
#include <cstdlib>
#include <ctime>

using namespace std;

int main()
{
    int lines, links;
    double stopTime;

    cout << "Enter number of telephone lines: ";
    cin >> lines;

    cout << "Enter number of communication links: ";
    cin >> links;

    cout << "Enter simulation time (minutes): ";
    cin >> stopTime;

    srand(time(0));

    int busyLines = 0;
    int busyCalls = 0;
    int blockedCalls = 0;

    int totalCalls = stopTime * 10;     // Assume 10 calls per minute

    for(int i=1; i<=totalCalls; i++)
    {
        // 60% chance a new call arrives
        if(rand()%100 < 60)
        {
            if(busyLines + 2 <= lines && busyCalls < links)
            {
                busyLines += 2;      // Two telephone lines become busy
                busyCalls++;

                cout << "Call " << i << " Connected\n";

                // Randomly end some calls
                if(rand()%100 < 50)
                {
                    busyLines -= 2;
                    busyCalls--;
                }
            }
            else
            {
                blockedCalls++;
                cout << "Call " << i << " Blocked\n";
            }
        }
    }

    cout << "\nSimulation Result\n";
    cout << "-----------------\n";
    cout << "Total Calls   : " << totalCalls << endl;
    cout << "Connected     : " << totalCalls - blockedCalls << endl;
    cout << "Blocked Calls : " << blockedCalls << endl;

    return 0;
}