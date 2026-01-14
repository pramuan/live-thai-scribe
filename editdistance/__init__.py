try:
    import editdistance_s as ed
except ImportError:
    ed = None

def eval(a, b):
    if ed:
        return ed.distance(a, b)
    return 0

def distance(a, b):
    if ed:
        return ed.distance(a, b)
    return 0
