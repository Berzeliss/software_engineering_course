def addition(a, b):
    return a + b

def subtraction(a, b):
    return a - b

def multiplication(a, b):
    return a * b

def division(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

def exit_calculator():
    print("Exiting the calculator. Goodbye!")
    exit()

def main():
    while True:
        print("Select operation:")
        print("1. Addition")
        print("2. Subtraction")
        print("3. Multiplication")
        print("4. Division")
        print("5. Exit")

        choice = input("Enter choice (1/2/3/4/5): ")

        if choice in ['1', '2', '3', '4']:
            num1 = float(input("Enter first number: "))
            num2 = float(input("Enter second number: "))

            if choice == '1':
                print(f"The result is: {addition(num1, num2)}")
            elif choice == '2':
                print(f"The result is: {subtraction(num1, num2)}")
            elif choice == '3':
                print(f"The result is: {multiplication(num1, num2)}")
            elif choice == '4':
                try:
                    print(f"The result is: {division(num1, num2)}")
                except ValueError as e:
                    print(e)
        elif choice == '5':
            exit_calculator()
        else:
            print("Invalid input. Please try again.")

if __name__ == "__main__":
    main()