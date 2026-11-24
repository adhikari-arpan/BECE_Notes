import numpy as np
import pandas as pd
from scipy.stats import chi2

# 1. Generate 100 random numbers between 0 and 1
np.random.seed(42)  # Setting seed ensures you get the exact same results every run
n_samples = 100
random_numbers = np.random.rand(n_samples)

print("Generated Random Numbers (First 10 shown for space):")
print(random_numbers[:10], "... etc.")
print("\n" + "="*60 + "\n")

# 2. Set up the 10 intervals from 0.0 to 1.0
bins = np.arange(0, 1.1, 0.1)
bin_labels = [f"{bins[i]:.1f} - {bins[i+1]:.1f}" for i in range(10)]

# 3. Calculate observed frequencies per interval
observed_freq, _ = np.histogram(random_numbers, bins=bins)

# 4. Calculate expected frequencies 
# If numbers are perfectly uniform, each of the 10 bins expects an equal share (100 / 10 = 10)
expected_freq = np.full(10, n_samples / 10)

# 5. Compute the intermediate mathematical steps
O_minus_E_sq = (observed_freq - expected_freq) ** 2
O_minus_E_sq_over_E = O_minus_E_sq / expected_freq

# 6. Create the structured breakdown table
df_table = pd.DataFrame({
    'Interval': bin_labels,
    'Observed Freq (O)': observed_freq,
    'Expected Freq (E)': expected_freq,
    '(O-E)^2': O_minus_E_sq,
    '(O-E)^2/E': O_minus_E_sq_over_E
})

# Display the table
print(df_table.to_string(index=False))
print("\n" + "="*60 + "\n")

# 7. Calculate final Chi-Square Statistic and Critical Value
chi2_stat = np.sum(O_minus_E_sq_over_E)

alpha = 0.05
degrees_of_freedom = len(bins) - 1 - 1  # 10 bins - 1 = 9
critical_value = chi2.ppf(1 - alpha, degrees_of_freedom)

print(f"Calculated Chi-Square Value ($\chi^2$): {chi2_stat:.4f}")
print(f"Critical Value at alpha = 0.05:      {critical_value:.4f}")

# 8. Finalize Hypothesis Decision
if chi2_stat > critical_value:
    print("\nResult: Reject the Null Hypothesis.")
    print("Conclusion: The generated random numbers do NOT follow a uniform distribution.")
else:
    print("\nResult: Fail to Reject the Null Hypothesis (Accept).")
    print("Conclusion: The generated random numbers are distributed uniformly.")