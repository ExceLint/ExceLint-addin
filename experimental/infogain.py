import math

class Primal:
    
    primes = {}

    def __init__(self):
        pass
    
    """ Returns true iff n is prime."""
    @staticmethod
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
    @staticmethod
    def nthprime(n):
        # Use a memorized table.
        if n in Primal.primes:
            return Primal.primes[n]
        if n == 0 or n == 1:
            Primal.primes[0] = 2
            Primal.primes[1] = 3
            return Primal.primes[n]
        for i in range(len(Primal.primes), n+1):
            curr_prime = Primal.primes[i-1]
            # Find the next prime number and record it.
            summand = 2
            while not Primal.isprime(summand + curr_prime):
                summand += 2
            Primal.primes[i] = summand + curr_prime
        return Primal.primes[n]



class InfoGain:

    """Compute normalized entropy of a pmf (between 0 and 1)."""
    @staticmethod
    def normalized_entropy(counts):
        total = sum(counts)
        entropy = 0
        for i in range(0,len(counts)):
            freq = counts[i] / total
            if freq != 0:
                entropy -= freq * math.log2(freq)
        return entropy / math.log2(total)


    """Compute Shannon entropy of a pmf."""
    @staticmethod
    def entropy(counts):
        total = sum(counts)
        entropy = 0
        for i in range(0,len(counts)):
            freq = counts[i] / total
            if freq != 0:
                entropy += -freq * math.log2(freq)
        return entropy

    """Compute the salience (entropy-discounted "importance", from 0 to 1) of an index in a pmf."""
    @staticmethod
    def salience(counts, index):
        total = sum(counts)
        p_index = counts[index] / total
        salience = (1 - p_index) * (1-InfoGain.normalized_entropy(counts))
        return salience
    
class Stencil:

    # Pick one of these stencils, whose names should be self-explanatory.
    useNinePointStencil = True
    useEightPointStencil = False  # exclude the center
    useFivePointStencil = False
    useOnePointStencil = False

    reflectStencils = True  # False

    @staticmethod
    def apply_stencil(stencil, arr, i, j, base, operator):
        v = base
        for (x,y) in stencil:
            # Transform x and y here, since the first coordinate is
            # actually the row (y-coord) and the second is the column
            # (x-coord).
            v = operator(v, arr[i + y][j + x])
        return v # (v / len(stencil)) # FIXME?
        
    @staticmethod
    def stencil_computation(arr, operator, base):
        # Array is 2D
        nrows = len(arr)
        ncols = len(arr[0])
        # Make a new array of zeroes of the same size.
        new_arr = [[0 for c in range(0,ncols)] for r in range(0,nrows)]
        # Define stencils by their coordinates (x offset, y offset).

        assert Stencil.useNinePointStencil ^ \
        Stencil.useEightPointStencil ^ \
        Stencil.useFivePointStencil ^ \
        Stencil.useOnePointStencil, "Exactly one stencil choice should be used."
        
        if Stencil.useNinePointStencil:
            stencil = [(-1,-1), (-1,0), (-1,1), (0,-1), (0, 0), (0,1), (1,-1), (1,0), (1,1)]

        if Stencil.useEightPointStencil:
            stencil = [(-1,-1), (-1,0), (-1,1), (0,-1), (0,1), (1,-1), (1,0), (1,1)]
            
        if Stencil.useFivePointStencil:
            # cross or "plus" stencil (five-points)
            stencil = [(-1,0), (0,-1), (0, 0), (1,0), (0,1)]

        if Stencil.useOnePointStencil:
            # just the center itself.
            stencil = [(0,0)]
        
        # Define boundary condition stencils by clipping the stencil at
        # the boundaries (edges and then corners).
        # NOTE: we optionally REFLECT the stencil here so it is always the same size.

        stencil_right    = [(x,y) for (x,y) in stencil if x <= 0]
        stencil_left     = [(x,y) for (x,y) in stencil if x >= 0]
        stencil_top = [(x, y) for (x, y) in stencil if y >= 0]
        
        print("top was = " + str(stencil_top))

        stencil_bottom   = [(x,y) for (x,y) in stencil if y <= 0]
        stencil_topleft  = [(x,y) for (x,y) in stencil_top if x >= 0]
        stencil_topright = [(x,y) for (x,y) in stencil_top if x <= 0]
        stencil_bottomleft  = [(x,y) for (x,y) in stencil_bottom if x >= 0]
        stencil_bottomright = [(x,y) for (x,y) in stencil_bottom if x <= 0]

        if Stencil.reflectStencils:
            # "reflect" the stencil for edge cases.
            stencil_right    += [(-x,y) for (x,y) in stencil if x > 0]
            stencil_left     += [(-x,y) for (x,y) in stencil if x < 0]
            stencil_top      += [(x,-y) for (x,y) in stencil if y < 0]

            print("top = " + str(stencil_top))

            stencil_bottom   += [(x,-y) for (x,y) in stencil if y > 0]
            stencil_topleft += [(-x, y) for (x, y) in stencil_top if x < 0] + [(x, -y) for (x, y) in stencil_left if y < 0]
            print("length of topleft = " + str(len(stencil_topleft)))
            stencil_topright += [(-x,y) for (x,y) in stencil_top if x > 0] + [(x,-y) for (x,y) in stencil_right if y < 0]
            stencil_bottomleft  += [(-x,y) for (x,y) in stencil_bottom if x < 0] + [(x,-y) for (x,y) in stencil_left if y > 0]
            stencil_bottomright += [(-x,y) for (x,y) in stencil_bottom if x > 0] + [(x,-y) for (x,y) in stencil_right if y > 0]

        # Interior
        for i in range(1,ncols-1):
            for j in range(1,nrows-1):
                new_arr[i][j] = Stencil.apply_stencil(stencil, arr, i, j, base, operator)
        # Edges
        ## Top and bottom
        for j in range(1,ncols-1):
            new_arr[0][j]         = Stencil.apply_stencil(stencil_top, arr, 0, j, base, operator)
            new_arr[nrows-1][j]   = Stencil.apply_stencil(stencil_bottom, arr, nrows-1, j, base, operator)
        ## Left and right
        for i in range(1,nrows-1):
            new_arr[i][0]         = Stencil.apply_stencil(stencil_left, arr, i, 0, base, operator)
            new_arr[i][ncols-1]   = Stencil.apply_stencil(stencil_right, arr, i, ncols-1, base, operator)
        # Corners
        new_arr[0][0]             = Stencil.apply_stencil(stencil_topleft, arr, 0, 0, base, operator)
        new_arr[0][ncols-1]       = Stencil.apply_stencil(stencil_topright, arr, 0, ncols-1, base, operator)
        new_arr[nrows-1][0]       = Stencil.apply_stencil(stencil_bottomleft, arr, nrows-1, 0, base, operator)
        new_arr[nrows-1][ncols-1] = Stencil.apply_stencil(stencil_bottomright, arr, nrows-1, ncols-1, base, operator)
        return new_arr



class Encoder:

    """Substitute each MATRIX entry with a (fixed) prime number."""
    @staticmethod
    def primal_matrix(mat):
        prime_array = {}
        nth = 0
        ret_mat = []
        for arr in mat:
            ret_array = []
            for i in arr:
                if i not in prime_array:
                    prime = Primal.nthprime(nth)
                    prime_array[i] = prime
                    nth += 1
                ret_array += [prime_array[i]]
            ret_mat.append(ret_array)
        return ret_mat


    """Substitute each MATRIX entry with a (fixed) 'one-hot' number."""
    @staticmethod
    def onehot_matrix(mat):
        onehot_array = {}
        nth = 0
        ret_mat = []
        for arr in mat:
            ret_array = []
            for i in arr:
                if i not in onehot_array:
                    onehot = 1 << nth
                    onehot_array[i] = onehot
                    nth += 1
                ret_array += [onehot_array[i]]
            ret_mat.append(ret_array)
        return ret_mat

# print(primal_array([1,2,3,4,5,1,2,3,4,5,1]))

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

#print(normalized_entropy([1000,1]))
print(InfoGain.salience([1000,1], 1))
print(InfoGain.salience([1000,1], 0))
print(InfoGain.salience([1,1], 0))
print(InfoGain.salience([1,1,1], 0))
print("trying a range:")
s = 0
for x in range(0,4):
    v = InfoGain.salience([1,10,1,1], x)
    s += v
    print(v)
print("--- : sum = " + str(s))
print(InfoGain.salience([1,20000], 0))
print(InfoGain.salience([1,2], 0))
print(InfoGain.salience([1,2,2], 0))
print(InfoGain.salience([1,2,2,2,2], 0))
print(InfoGain.salience([1,2,2,2,2,2,2,2,2], 0))

arr = [[1 for i in range(0,10)] for i in range(0,10)]
arr[3][5] = 14
arr[7][8] = 99

#arr = [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]]
#arr = [[1,1,1,1,1],[2,2,2,2,2],[3,3,3,3,3],[4,4,4,4,4],[5,5,5,5,5]]
# arr = [[1,4,4,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,8,1,1],[1,1,1,1,1]]
#arr = [[1,1,1,1,1],[1,1,8,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]]
#arr = [[1,2,3,4,1],[1,2,8,3,1],[4,5,3,2,4],[5,2,3,4,1],[1,3,4,2,1]]
#arr = [[1,2,2,2,2],[2,2,8,2,2],[2,2,2,2,4],[2,2,2,1,1],[2,2,2,2,1]]
#arr = [[1,4,4,2,3],[5,6,7,100,9],[10,11,12,13,14],[15,16,8,17,18],[19,20,21,22,23]]

usePrimeEncoding =  False # True # False
useOneHotEncoding = False
useNoEncoding = True

assert usePrimeEncoding ^ useOneHotEncoding ^ useNoEncoding, "Exactly one encoding should be used."

# Use n-th prime encoding.

if usePrimeEncoding:
    #arr = [[1,2,2,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,3,1,1],[1,1,1,1,1]]
    prime_encoding = Encoder.primal_matrix(arr)
    arr = prime_encoding
    print("prime encoding = " + str(arr))
    arr = Stencil.stencil_computation(arr, times, 1)

if useOneHotEncoding:
    arr = Encoder.onehot_matrix(arr)
    print("onehot = " + str(arr))
    arr = Stencil.stencil_computation(arr, bitor, 0)

if useNoEncoding:
    arr = Stencil.stencil_computation(arr, times, 1)

    
# arr = Stencil.stencil_computation(arr, bitor, 0)
# arr = Stencil.stencil_computation(arr, plus, 0)
z=arr
print(z)

# Compute salience for the whole array, post stencil.
# Flatten array.
flat_z = [item for sublist in z for item in sublist]
# Get counts.
counts = Counter(flat_z)
# Convert to an array
keys = list(counts.keys())
arr = list(counts.values())
print("arr = " + str(arr))
salience_array = [(keys[i],InfoGain.salience(arr, i)) for i in range(0,len(arr))]
print("salience array = " + str(salience_array))
#print(counts)

for i in range(0, len(z)):
    for j in range(0, len(z[0])):
        pass
    
