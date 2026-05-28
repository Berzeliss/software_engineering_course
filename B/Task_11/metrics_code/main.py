import calculator
import processing
import utils

def run():
    data = [1, 5, 10, 15, 20, 25]

    result1 = calculator.calculate_all(10, 0)
    result2 = processing.process_list(data)
    result3 = utils.fake_complex_logic(42)

    print("Result 1:", result1)
    print("Result 2:", result2)
    print("Result 3:", result3)

    # unnecessary duplication (intentional smell)
    if result1 == 0:
        print("Zero result")
    else:
        print("Non-zero result")

    if result1 == 0:
        print("Repeated check again")  # duplication smell

run()