class RedisObjectProxy {
    constructor(redis, key, initialObject, ...namespace) {
        this.internal = initialObject != null ? initialObject : {};
        this.redis = redis;
        this.key = key;
        this.namespace = namespace || [];

        for (const [k, v] of Object.entries(this.internal)) {
            if (typeof v == 'object') {
                if (Array.isArray(v)) {
                    this.internal[k] = new RedisArrayProxy(this.redis, this.key, v, ...this.namespace, k);
                }
                else {
                    this.internal[k] = new RedisObjectProxy(this.redis, this.key, v, ...this.namespace, k);
                }
            }
        }

        return new Proxy(this.internal, this);
    }

    _getRedisPath(...path) {
        return ['$', ...this.this.namespace, ...path].join('.');
    }

    set(target, property, value, receiver) {
        switch(typeof value) {
            case 'string':
            case 'number':
            case 'boolean':
                // this.redis.json.set(this.key, this._getRedisPath(property), value)
                // .catch(() => console.error('Failed to set for ' + this.namespace));

                return Reflect.set(target, property, value, receiver);
            case 'object':
                let objectWrapper = null;
                if (Array.isArray(value)) {
                    objectWrapper = new RedisArrayProxy(this.redis, this.key, null, ...this.namespace, property);
                }
                else {
                    objectWrapper = new RedisObjectProxy(this.redis, this.key, null, ...this.namespace, property);
                }

                for (const [k, v] of Object.entries(value)) {
                    objectWrapper[k] = v;
                }

                return Reflect.set(target, property, objectWrapper, receiver);
            default:
                return false;
        }
    }

    deleteProperty(target, property) {
        return Reflect.deleteProperty(target, property);
    }

    get(target, property, receiver) {
        return Reflect.get(target, property, receiver);
    }
}

class RedisArrayProxy extends RedisObjectProxy {
    constructor(redis, key, initialObject, ...namespace) {
        initialObject = initialObject || [];

        super(redis, key, initialObject, ...namespace);
    }

    set(target, property, value, receiver) {
        if (!Number.isInteger(value) || +value < 0) {
            return Reflect.set(target, property, value, receiver);
        }

        switch(typeof value) {
            case 'string':
            case 'number':
            case 'boolean':
                // if (property in target) {

                // }
                // else {

                // }

                return Reflect.set(target, property, value, receiver);
            default:
                return super.set(target, property, value, receiver);
        }
    }

    deleteProperty(target, property) {
        if (!Number.isInteger(value) || +value < 0) {
            return Reflect.deleteProperty(target, property);
        }

        return Reflect.deleteProperty(target, property);
    }
}
