# # Append the following elements to my_list: 10, 20, 30, 40
number = [10, 20, 30, 40]
print(number)


#Insert the value 15 at the second position in the list.
number.insert(1, 15)
print("after insert:", number)

# # Extend my_list with another list: [50, 60, 70].
number2 = [50, 60, 70]

number.extend(number2)


print("after extend:", number)


# # Remove the last element from my_list.
del number[-1]

print("after del:", number)

 # Sort my_list in ascending order.
number.sort()

print("after sort:", number)



# # Find and print the index of the value 30 in my_list.
print("index of 30:", number.index(30))