def calculate_all(a, b):
    # multiple branching (increases complexity)
    if b == 0:
        return 0
    if a > b:
        return a + b
    elif a == b:
        return a * b
    else:
        return a - b


def unused_helper(x):
    # intentionally unused function (tool will detect)
    return x * 999