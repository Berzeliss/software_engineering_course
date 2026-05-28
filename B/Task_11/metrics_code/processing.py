def process_list(items):
    result = []

    for i in items:
        if i > 20:
            if i % 2 == 0:
                result.append(i * 2)
            else:
                result.append(i + 1)
        else:
            result.append(i - 1)

    return result


def messy_function(x):
    # deep nesting (code smell + complexity)
    if x > 0:
        if x < 100:
            if x % 2 == 0:
                if x > 50:
                    return True
                else:
                    return False
            else:
                return False
    return None