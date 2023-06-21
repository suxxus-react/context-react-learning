import { useState, useContext, useMemo, createContext, useEffect } from "react";
import "./App.css";

const USERS_API_URL = "https://dummyjson.com/users";

type User = {
  id: string;
  firstName: string;
  lastName: string;
};

type UserDTO = {
  id?: string;
  firstName?: string;
  lastName?: string;
};

type Dict<T> = Record<string, T>;

type UserId = string;

type Users = {
  ids: UserId[];
  data: Dict<User>;
};

type Children = {
  children: React.ReactNode;
};

// ========================

async function fetchUsers(url: string): Promise<UserDTO[]> {
  const response = await fetch(url);
  const json = await response.json();

  if (response.ok) {
    return json?.users ? (json.users as UserDTO[]) : [];
  }

  throw new Error("something went wrong");
}

function validateUsers(users: UserDTO[]): User[] {
  return users
    .reduce((acc: UserDTO[], value: UserDTO) => {
      const user: User = {
        id: value.id || "",
        firstName: value.firstName || "",
        lastName: value.lastName || "",
      };

      return [...acc, user] as User[];
    }, [])
    .filter((item: User) =>
      [item.id, item.firstName, item.lastName].every((t) => t)
    );
}

function transformUserData(users: User[]): Users {
  return users.reduce(
    (acc, value) => ({
      ...acc,
      data: {
        ...acc.data,
        [value.id]: {
          ...value,
        },
      },
    }),
    {
      ids: users.map(({ id }) => id.toString()),
      data: {},
    }
  );
}

const UserContext = createContext<Users>({
  ids: [],
  data: {},
});

function UserContextProvider({ children }: Children): JSX.Element {
  const [users, setUsers] = useState<Users>({ ids: [], data: {} });

  useEffect(() => {
    fetchUsers(USERS_API_URL).then((result) => {
      setUsers(transformUserData(validateUsers(result)));
    });
  }, []);

  const contextValue = useMemo(() => users, [users]);

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

function useUserContext() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUserContext was used outside of its Provider");
  }

  return context;
}

function Page() {
  const { data, ids } = useUserContext();
  return (
    <ul>
      {ids.map((id) => (
        <li key={`item-${id.toString()}`}>{data[id].firstName}</li>
      ))}
    </ul>
  );
}

function App(): JSX.Element {
  return (
    <UserContextProvider>
      <Page />
    </UserContextProvider>
  );
}

export default App;
