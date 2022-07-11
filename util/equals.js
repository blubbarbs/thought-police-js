function looseEquals(obj1, obj2) {
    if (typeof obj1 != typeof obj2) {
        console.log('Type check failed');
        return false;
    }

    if (typeof obj1 != 'object') {
        return obj1 == obj2;
    }

    if (Array.isArray(obj1) != Array.isArray(obj2)) {
        console.log('Array type check failed');
        return false;
    }

    if (Array.isArray(obj1)) {
        if (obj1.length != obj2.length) {
            console.log('Array length check failed');
            return false;
        }

        for (let i = 0; i < obj1.length; i++) {
            const arrObj1 = obj1[i];
            const arrObj2 = obj2[i];

            if (!looseEquals(arrObj1, arrObj2)) {
                return false;
            }
        }

        return true;
    }

    for (const [key, value1] of Object.entries(obj1)) {
        const value2 = obj2[key];

        if (!looseEquals(value1, value2)) {
            return false;
        }
    }

    return true;
}

module.exports = {
    looseEquals: looseEquals
}