# write a python program that will acept user details and store them in a list. and print it for the user using the list. append() method.
# the code is as follows:


# creating an  empty list

user_list = []
# taking user input for name, age, and email
name = input("Enter your name: ")
age = input("Enter your age: ")
email = input("Enter your email: ")
# appending the user details to the list using the append() method
user_list.append(name) 
user_list.append(age) 
user_list.append(email) 
# printing the list
print("User Details: ", user_list)
