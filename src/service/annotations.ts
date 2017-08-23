export function Required(target: any, key: string) {
  Reflect.defineMetadata(key, 'true', target, 'required');
}

export function MaxLength(size: number) {
  return function(target: any, key: string) {
    Reflect.defineMetadata(key, size, target, 'maxLength');
  };
}

export function References(ref: string) {
  return function(target: any, key: string) {
    Reflect.defineMetadata(key, ref, target, 'references');
  };
}

export function Enum(ids: Array<string | number>, names: Array<string>) {
  const res = [];
  for (let i = 0; i < ids.length; i++) {
    res.push({id: ids[i], nombre: names[i]});
  }
  return function(target: any, key: string) {
    Reflect.defineMetadata(key, res, target, 'enum');
  };
}
