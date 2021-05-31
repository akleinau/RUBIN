import numpy as np

"""
Script for calculating the marginal probability of a variable based on the conditional probabilities
in an n-dimensional list.
"""


def getMarginalProbability(array, axis):
    """
    Calculates the marginal probability for a given variable's dimension in the array based on the given array
    :param array:   n-dimensional python list
    :param axis:     dimension of the variable of interest
    :return:        List containing the m
    """
    array = np.array(array)
    dim = array.ndim
    for i in range(dim):
        if dim-i-1 != axis:
            array = array.sum(dim-i-1)
            if axis > dim-i-1:
                axis -= 1
    return array


