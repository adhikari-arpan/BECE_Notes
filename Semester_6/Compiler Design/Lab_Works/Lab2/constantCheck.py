# WAP to find whether the given input is constant or not i.e. enclosed within "".

def is_constant(val):
    val = val.strip()
    if val.startswith('"') and val.endswith('"'):
        return True
    else:
        return False

# Test Cases
test_cases = ['"Hello, World!"', '12345', '"Python is great!"', 'Not a constant']

for val in test_cases:
    if is_constant(val):
        print(f'{val} is constant')
    else:
        print(f'{val} is not constant')