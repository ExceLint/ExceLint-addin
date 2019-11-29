import math

def normalized_entropy(counts):
    if len(counts) <= 1:
        return 0
    total = 0
    for i in range(0,len(counts)):
        total += counts[i]
    entropy = 0
    for i in range(0,len(counts)):
        freq = counts[i] / total
        entropy += -freq * math.log2(freq)
    return entropy / math.log2(total)


def entropy(counts):
    if len(counts) <= 1:
        return 0
    total = 0
    for i in range(0,len(counts)):
        total += counts[i]
    entropy = 0
    for i in range(0,len(counts)):
        freq = counts[i] / total
        entropy += -freq * math.log2(freq)
    return entropy


def information_gain(counts, index):
    e1 = entropy(counts)
    del counts[index]
    e2 = entropy(counts)
    return e1 - e2


import random

# compute odds that a randomly chosen item will NOT be as rare or rarer than the item at the given index
def salience(counts, index):
    # Compute:
    #   numerator   = total number of counts <= counts[index].
    #   denominator = total of all counts.
    numerator = 0
    denominator = 0
    for i in range(0, len(counts)):
        if counts[i] <= counts[index]:
            numerator += counts[i]
        denominator += counts[i]
    return (1-numerator/denominator)


def apply_stencil(stencil, arr, i, j, base, operator):
#    print(len(stencil))
    v = base
    for (x,y) in stencil:
        # Transform x and y here, since the first coordinate is
        # actually the row (y-coord) and the second is the column
        # (x-coord).
        v = operator(v, arr[i + y][j + x])
    return v
    
def stencil_computation(arr, operator, base):
    # Array is 2D
    nrows = len(arr)
    ncols = len(arr[0])
    # Make a new array of zeroes of the same size.
    new_arr = [[0 for c in range(0,ncols)] for r in range(0,nrows)]
    # Define stencils by their coordinates (x offset, y offset).
    stencil = [(-1,-1), (-1,0), (-1,1), (0,-1), (0, 0), (0,1), (1,-1), (1,0), (1,1)]

    # Define boundary condition stencils by clipping the stencil at
    # the boundaries (edges and then corners).
    # NOTE: we REFLECT the stencil here so it is always the same size.

    # stencil_right    = [(x,y) for (x,y) in stencil if x <= 0]
    stencil_right    = [(x,y) for (x,y) in stencil if x <= 0] + [(-x,y) for (x,y) in stencil if x > 0]
    
    # stencil_left     = [(x,y) for (x,y) in stencil if x >= 0]
    stencil_left     = [(x,y) for (x,y) in stencil if x >= 0] + [(-x,y) for (x,y) in stencil if x < 0]
    
    # stencil_top      = [(x,y) for (x,y) in stencil if y >= 0]
    stencil_top      = [(x,y) for (x,y) in stencil if y >= 0] + [(x,-y) for (x,y) in stencil if y < 0]
    
    # stencil_bottom   = [(x,y) for (x,y) in stencil if y <= 0]
    stencil_bottom   = [(x,y) for (x,y) in stencil if y <= 0] + [(x,-y) for (x,y) in stencil if y > 0]
    
    # stencil_topleft  = [(x,y) for (x,y) in stencil_top if x >= 0]
    stencil_topleft  = [(x,y) for (x,y) in stencil_top if x >= 0] + [(-x,y) for (x,y) in stencil_top if x < 0]
    
    # stencil_topright = [(x,y) for (x,y) in stencil_top if x <= 0]
    stencil_topright = [(x,y) for (x,y) in stencil_top if x <= 0] + [(-x,y) for (x,y) in stencil_top if x > 0]
    
    # stencil_bottomleft  = [(x,y) for (x,y) in stencil_bottom if x >= 0]
    stencil_bottomleft  = [(x,y) for (x,y) in stencil_bottom if x >= 0] + [(-x,y) for (x,y) in stencil_bottom if x < 0]
    
    # stencil_bottomright = [(x,y) for (x,y) in stencil_bottom if x <= 0]
    stencil_bottomright = [(x,y) for (x,y) in stencil_bottom if x <= 0] + [(-x,y) for (x,y) in stencil_bottom if x > 0]
    
    # Interior
    for i in range(1,ncols-1):
        for j in range(1,nrows-1):
            new_arr[i][j] = apply_stencil(stencil, arr, i, j, base, operator)
    # Edges
    ## Top and bottom
    for j in range(1,ncols-1):
        new_arr[0][j]         = apply_stencil(stencil_top, arr, 0, j, base, operator)
        new_arr[nrows-1][j]   = apply_stencil(stencil_bottom, arr, nrows-1, j, base, operator)
    ## Left and right
    for i in range(1,nrows-1):
        new_arr[i][0]         = apply_stencil(stencil_left, arr, i, 0, base, operator)
        new_arr[i][ncols-1]   = apply_stencil(stencil_right, arr, i, ncols-1, base, operator)
    # Corners
    new_arr[0][0]             = apply_stencil(stencil_topleft, arr, 0, 0, base, operator)
    new_arr[nrows-1][0]       = apply_stencil(stencil_bottomleft, arr, nrows-1, 0, base, operator)
    new_arr[0][ncols-1]       = apply_stencil(stencil_topright, arr, 0, ncols-1, base, operator)
    new_arr[nrows-1][ncols-1] = apply_stencil(stencil_bottomright, arr, nrows-1, ncols-1, base, operator)
    return new_arr

primes = {}

""" Returns true iff n is prime."""
def isprime(n):
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    for i in range(3,int(math.sqrt(n) + 1), 2):
        if n % i == 0:
            return False
    return True

"""Return the nth prime number (0 = 2)."""
def nthprime(n):
    # Use a memorized table.
    if n in primes:
        return primes[n]
    if n == 0:
        primes[0] = 2
        return 2
    if n == 1:
        primes[1] = 3
        return 3
    curr_prime = primes[len(primes)-1]
    for i in range(len(primes)-1, n+1):
        # Find the next prime number and record it.
        summand = 2
        while not isprime(summand + curr_prime):
            summand += 2
        primes[i] = summand + curr_prime
    return primes[n]

#for i in range(1,1000):
#    print(nthprime(i-1))
#    if isprime(i):
#        print(i)
        

"""Substitute each array entry with a (fixed) prime number."""
def primal_array(arr):
    prime_array = {}
    ret_array = []
    nth = 0
    for i in arr:
        print("i = " + str(i))
        if i not in prime_array:
            prime = nthprime(nth)
            nth += 1
            prime_array[i] = prime
            print("prime_array = " + str(prime_array))
        ret_array += [prime_array[i]]
    return ret_array

"""Substitute each MATRIX entry with a (fixed) prime number."""
def primal_matrix(mat):
    prime_array = {}
    nth = 0
    ret_mat = []
    for arr in mat:
        ret_array = []
        for i in arr:
            print("i = " + str(i))
            if i not in prime_array:
                prime = nthprime(nth)
                nth += 1
                prime_array[i] = prime
            ret_array += [prime_array[i]]
        ret_mat.append(ret_array)
    return ret_mat

print(primal_array([1,2,3,4,5,1,2,3,4,5,1]))

def plus(x,y):
    return x+y

def times(x,y):
    return x*y

def bitor(x,y):
    return x | y

from collections import Counter

# arr = [[1,1,1],[1,2,1],[1,1,1]]
# arr = [[1,1,2,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]]

# Use one-hot encoding.

arr = [[1,1,4,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,2,1,1],[1,1,1,1,1]]
print(arr)

# Use n-th prime encoding.

arr = [[1,2,2,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,3,1,1],[1,1,1,1,1]]
prime_encoding = primal_matrix(arr)
print("prime encoding = " + str(prime_encoding))

arr = stencil_computation(prime_encoding, times, 1)
# arr = stencil_computation(arr, bitor, 0)
# arr = stencil_computation(arr, plus, 0)
z=arr
print(z)

# Compute salience for the whole array, post stencil.
# Flatten array.
flat_z = [item for sublist in z for item in sublist]
print("flat z = " + str(flat_z))
# Get counts.
counts = Counter(flat_z)
# Convert to an array
keys = list(counts.keys())
arr = list(counts.values())
print("arr = " + str(arr))
salience_array = [(keys[i],salience(arr, i)) for i in range(0,len(arr))]
print("salience array = " + str(salience_array))
#print(counts)

for i in range(0, len(z)):
    for j in range(0, len(z[0])):
        pass
    
# compute odds that a randomly chosen item will be as rare or rarer than the item at the given index
def lets_do_this(counts, index):
    # Monte Carlo time.
    num_iterations = 10000
    as_rare_count = 0
    classes = range(0, len(counts))
    for i in range(0, num_iterations):
        class_choice = random.choices(classes, counts)[0]
        if counts[class_choice] <= counts[index]:
            as_rare_count += 1
    return as_rare_count / num_iterations

    
