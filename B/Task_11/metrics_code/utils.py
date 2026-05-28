def fake_complex_logic(value):
    total = 0

    # unnecessary loop complexity
    for i in range(10):
        if i % 2 == 0:
            total += i * value
        else:
            total -= i

    # redundant condition
    if total > 100:
        if total > 50:
            return total
        else:
            return 50
    else:
        return total


def duplicate_style_function():
    x = 1
    y = 2
    z = x + y
    return z