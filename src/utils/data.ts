export const USERS = [
{ "id": 1, "name": "Renan", "city_id": 101 },
  { "id": 2, "name": "Alice", "city_id": 102 },
  { "id": 3, "name": "Bob", "city_id": 101 },
  { "id": 4, "name": "Charlie", "city_id": 999 }
]

export const CITIES = [
  { "id": 101, "name": "Rio de Janeiro", "uf": "RJ" },
  { "id": 102, "name": "São Paulo", "uf": "SP" },
  { "id": 103, "name": "Belo Horizonte", "uf": "MG" } 
]

export const FLAT_INITIAL_DATA = [
  { "id": 1, "name": "Alice", "age": 25, "city": "Rio" },
  { "id": 2, "name": "Bob", "age": 17, "city": "SP" },
  { "id": 3, "name": "Charlie", "age": 30, "city": "BH" },
  { "id": 4, "name": "David", "age": 40, "city": "Salvador" },
  { "id": 5, "name": "Eve", "age": 22, "city": "Brasília" },
  { "id": 6, "name": "Frank", "age": 35, "city": "Manaus" },
  { "id": 7, "name": "Grace", "age": 29, "city": "Fortaleza" },
  { "id": 8, "name": "Hank", "age": 28, "city": "Recife" },
  { "id": 9, "name": "Ivy", "age": 24, "city": "Curitiba" },
  { "id": 10, "name": "Jack", "age": 26, "city": "Porto Alegre" },
  { "id": 11, "name": "Katie", "age": 32, "city": "Belo Horizonte" },
  { "id": 12, "name": "Leo", "age": 33, "city": "São Paulo" },
  { "id": 13, "name": "Mia", "age": 21, "city": "Florianópolis" },
  { "id": 14, "name": "Nate", "age": 23, "city": "Campinas" },
  { "id": 15, "name": "Olivia", "age": 27, "city": "Niterói" },
  { "id": 16, "name": "Paul", "age": 31, "city": "Maceió" },
  { "id": 17, "name": "Quinn", "age": 19, "city": "Santos" },
  { "id": 18, "name": "Rita", "age": 38, "city": "Vitória" },
  { "id": 19, "name": "Sam", "age": 36, "city": "Aracaju" },
  { "id": 20, "name": "Tina", "age": 34, "city": "Cuiabá" },
  { "id": 21, "name": "Ursula", "age": 39, "city": "Belém" },
  { "id": 22, "name": "Vince", "age": 22, "city": "Goiânia" },
  { "id": 23, "name": "Wendy", "age": 30, "city": "João Pessoa" },
  { "id": 24, "name": "Xander", "age": 28, "city": "Teresina" },
  { "id": 25, "name": "Yara", "age": 27, "city": "São Luís" },
  { "id": 26, "name": "Zane", "age": 24, "city": "Caxias do Sul" },
  { "id": 27, "name": "Aiden", "age": 29, "city": "Natal" },
  { "id": 28, "name": "Bella", "age": 22, "city": "Macapá" },
  { "id": 29, "name": "Cameron", "age": 25, "city": "São Gonçalo" },
  { "id": 30, "name": "Diana", "age": 31, "city": "Juiz de Fora" },
  { "id": 31, "name": "Ethan", "age": 23, "city": "Ribeirão Preto" },
  { "id": 32, "name": "Felicia", "age": 30, "city": "São João de Meriti" },
  { "id": 33, "name": "Gabriel", "age": 34, "city": "Olinda" },
  { "id": 34, "name": "Helen", "age": 38, "city": "Blumenau" },
  { "id": 35, "name": "Ian", "age": 25, "city": "São Bernardo do Campo" },
  { "id": 36, "name": "Julian", "age": 32, "city": "Novo Hamburgo" },
  { "id": 37, "name": "Kimberly", "age": 28, "city": "Maringá" },
  { "id": 38, "name": "Liam", "age": 26, "city": "São Caetano do Sul" },
  { "id": 39, "name": "Megan", "age": 29, "city": "Ponta Grossa" },
  { "id": 40, "name": "Noah", "age": 21, "city": "Bauru" },
  { "id": 41, "name": "Olga", "age": 33, "city": "Rio Grande" },
  { "id": 42, "name": "Perry", "age": 32, "city": "Petrolina" },
  { "id": 43, "name": "Quincy", "age": 28, "city": "Aracaju" },
  { "id": 44, "name": "Ralph", "age": 24, "city": "Tocantins" },
  { "id": 45, "name": "Sally", "age": 26, "city": "Itajaí" },
  { "id": 46, "name": "Travis", "age": 30, "city": "Palmas" },
  { "id": 47, "name": "Uriah", "age": 29, "city": "Cuiabá" },
  { "id": 48, "name": "Vera", "age": 27, "city": "Divinópolis" },
  { "id": 49, "name": "Wade", "age": 35, "city": "Porto Velho" },
  { "id": 50, "name": "Xena", "age": 22, "city": "Londrina" }
]

export const NESTED_INITIAL_DATA = [
  {
    "id": 1,
    "name": "Alice",
    "age": 25,
    "city": "Rio",
    "meta": {
      "views": 100,
      "created_at": "2023-01-01",
      "updated_at": "2023-05-12"
    },
    "address": {
      "street": "Av. Atlântica",
      "number": 123,
      "zip_code": "22021-060",
      "country": "Brasil"
    },
    "preferences": {
      "color": "blue",
      "language": "pt-BR",
      "notifications": {
        "email": true,
        "sms": false
      }
    }
  },
  {
    "id": 2,
    "name": "Bob",
    "age": 17,
    "city": "São Paulo",
    "meta": {
      "views": 50,
      "created_at": "2022-08-10",
      "updated_at": "2023-06-15"
    },
    "address": {
      "street": "Rua 25 de Março",
      "number": 450,
      "zip_code": "01023-001",
      "country": "Brasil"
    },
    "preferences": {
      "color": "green",
      "language": "en",
      "notifications": {
        "email": false,
        "sms": true
      }
    }
  },
  {
    "id": 3,
    "name": "Charlie",
    "age": 30,
    "city": "BH",
    "meta": {
      "views": 200,
      "created_at": "2021-05-20",
      "updated_at": "2023-01-25"
    },
    "address": {
      "street": "Rua dos Três Irmãos",
      "number": 987,
      "zip_code": "30130-080",
      "country": "Brasil"
    },
    "preferences": {
      "color": "red",
      "language": "pt-BR",
      "notifications": {
        "email": true,
        "sms": true
      }
    }
  },
  {
    "id": 4,
    "name": "David",
    "age": 40,
    "city": "Salvador",
    "meta": {
      "views": 150,
      "created_at": "2020-11-11",
      "updated_at": "2023-03-22"
    },
    "address": {
      "street": "Rua do Comércio",
      "number": 789,
      "zip_code": "40010-100",
      "country": "Brasil"
    },
    "preferences": {
      "color": "yellow",
      "language": "pt-BR",
      "notifications": {
        "email": true,
        "sms": false
      }
    }
  },
  {
    "id": 5,
    "name": "Eve",
    "age": 22,
    "city": "Brasília",
    "meta": {
      "views": 90,
      "created_at": "2022-02-14",
      "updated_at": "2023-07-30"
    },
    "address": {
      "street": "Eixo Monumental",
      "number": 456,
      "zip_code": "70040-000",
      "country": "Brasil"
    },
    "preferences": {
      "color": "purple",
      "language": "en",
      "notifications": {
        "email": false,
        "sms": true
      }
    }
  },
  {
    "id": 6,
    "name": "Frank",
    "age": 35,
    "city": "Manaus",
    "meta": {
      "views": 120,
      "created_at": "2021-04-12",
      "updated_at": "2023-09-01"
    },
    "address": {
      "street": "Rua do Rio Negro",
      "number": 203,
      "zip_code": "69000-000",
      "country": "Brasil"
    },
    "preferences": {
      "color": "orange",
      "language": "pt-BR",
      "notifications": {
        "email": true,
        "sms": true
      }
    },
    "social": {
      "facebook": "frank123",
      "twitter": "@frank_manaus",
      "instagram": "frank.manaus"
    }
  },
  {
    "id": 7,
    "name": "Grace",
    "age": 29,
    "city": "Fortaleza",
    "meta": {
      "views": 175,
      "created_at": "2020-09-05",
      "updated_at": "2023-11-21"
    },
    "address": {
      "street": "Avenida Beira Mar",
      "number": 1500,
      "zip_code": "60165-000",
      "country": "Brasil"
    },
    "preferences": {
      "color": "teal",
      "language": "es",
      "notifications": {
        "email": true,
        "sms": false
      }
    },
    "social": {
      "facebook": "grace_fortaleza",
      "twitter": "@gracefortaleza"
    }
  },
  {
    "id": 8,
    "name": "Hank",
    "age": 28,
    "city": "Recife",
    "meta": {
      "views": 140,
      "created_at": "2019-12-01",
      "updated_at": "2023-10-15"
    },
    "address": {
      "street": "Rua do Sol",
      "number": 800,
      "zip_code": "50000-100",
      "country": "Brasil"
    },
    "preferences": {
      "color": "pink",
      "language": "en",
      "notifications": {
        "email": false,
        "sms": true
      }
    },
    "social": {
      "facebook": "hank_recife",
      "instagram": "hank_recife"
    }
  },
  {
    "id": 9,
    "name": "Ivy",
    "age": 24,
    "city": "Curitiba",
    "meta": {
      "views": 80,
      "created_at": "2021-07-10",
      "updated_at": "2023-08-30"
    },
    "address": {
      "street": "Rua XV de Novembro",
      "number": 550,
      "zip_code": "80020-310",
      "country": "Brasil"
    },
    "preferences": {
      "color": "violet",
      "language": "pt-BR",
      "notifications": {
        "email": true,
        "sms": false
      }
    },
    "social": {
      "facebook": "ivycuritiba",
      "twitter": "@ivycuritiba"
    }
  },
  {
    "id": 10,
    "name": "Jack",
    "age": 26,
    "city": "Porto Alegre",
    "meta": {
      "views": 95,
      "created_at": "2022-01-15",
      "updated_at": "2023-12-01"
    },
    "address": {
      "street": "Rua dos Andradas",
      "number": 420,
      "zip_code": "90010-190",
      "country": "Brasil"
    },
    "preferences": {
      "color": "gray",
      "language": "pt-BR",
      "notifications": {
        "email": false,
        "sms": true
      }
    },
    "social": {
      "instagram": "jack_poa",
      "facebook": "jack_portoalegre"
    }
  },
  {
    "id": 11,
    "name": "Katie",
    "age": 32,
    "city": "Belo Horizonte",
    "meta": {
      "views": 250,
      "created_at": "2018-10-05",
      "updated_at": "2023-06-10"
    },
    "address": {
      "street": "Avenida Afonso Pena",
      "number": 1070,
      "zip_code": "30130-003",
      "country": "Brasil"
    },
    "preferences": {
      "color": "blue",
      "language": "pt-BR",
      "notifications": {
        "email": true,
        "sms": true
      }
    },
    "social": {
      "facebook": "katie_bh",
      "twitter": "@katiebh"
    }
  },
  {
    "id": 12,
    "name": "Leo",
    "age": 33,
    "city": "São Paulo",
    "meta": {
      "views": 200,
      "created_at": "2019-03-13",
      "updated_at": "2023-04-27"
    },
    "address": {
      "street": "Rua dos Três Irmãos",
      "number": 400,
      "zip_code": "01310-020",
      "country": "Brasil"
    },
    "preferences": {
      "color": "black",
      "language": "en",
      "notifications": {
        "email": false,
        "sms": true
      }
    },
    "social": {
      "instagram": "leo_sampa",
      "facebook": "leo.sp"
    }
  },
  {
    "id": 13,
    "name": "Mia",
    "age": 21,
    "city": "Florianópolis",
    "meta": {
      "views": 90,
      "created_at": "2021-11-01",
      "updated_at": "2023-07-12"
    },
    "address": {
      "street": "Rua João Pinto",
      "number": 320,
      "zip_code": "88015-210",
      "country": "Brasil"
    },
    "preferences": {
      "color": "white",
      "language": "pt-BR",
      "notifications": {
        "email": true,
        "sms": true
      }
    },
    "social": {
      "facebook": "mia_floripa",
      "twitter": "@mia_floripa"
    }
  }
]
