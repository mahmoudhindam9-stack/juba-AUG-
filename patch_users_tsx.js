import fs from "fs";
let content = fs.readFileSync("src/routes/admin/users.tsx", "utf8");

content = content.replace(/import \{ supabase \} from "@\/integrations\/supabase\/client";/, "");

const usersQueryReplace = `  // Subscribing to local store state
  const [localUsers, setLocalUsers] = useState(erpStore.getUsers());
  useEffect(() => {
    const unsub = erpStore.subscribe(() => {
      setLocalUsers(erpStore.getUsers());
      setErpState(erpStore.getState());
    });
    return unsub;
  }, []);

  const upsert = {
    isPending: false,
    mutate: () => {
      if (editing) {
        erpStore.upsertUser({
          ...editing,
          full_name: form.full_name,
          username: form.username,
          phone: form.phone,
          role: form.role,
          ...(form.password ? { password: form.password } : {})
        });
        setEditing(null);
        setForm({ employee_id: "", full_name: "", username: "", phone: "", password: "", role: "cashier" });
      } else {
        erpStore.upsertUser({
          id: \`u-\${Date.now()}\`,
          full_name: form.full_name,
          username: form.username,
          phone: form.phone,
          role: form.role,
          password: form.password,
          created_at: new Date().toISOString()
        });
        setForm({ employee_id: "", full_name: "", username: "", phone: "", password: "", role: "cashier" });
      }
      setIsConfirmUpsertOpen(false);
    }
  };

  const deleteUser = {
    isPending: false,
    mutate: () => {
      if (userToDelete) {
        erpStore.deleteUser(userToDelete);
      }
      setUserToDelete(null);
      setIsConfirmDeleteOpen(false);
    }
  };`;

// replace usersQuery to the end of deleteUser definition
const queryPattern =
  /const usersQuery = useQuery\(\{[\s\S]*?mutationFn: async \(\) => \{\s*if \(userToDelete\) \{\s*const \{ error \} = await supabase.from\("profiles"\).delete\(\).eq\("id", userToDelete\);\s*if \(error\) throw error;\s*\}\s*\},\s*onSuccess: \(\) => queryClient.invalidateQueries\(\{ queryKey: \["admin", "profiles"\] \}\),\s*\}\);/;
content = content.replace(queryPattern, usersQueryReplace);

// also we need to remove the first block which has upsert mutation
const firstBlockPattern =
  /const usersQuery = useQuery\(\{[\s\S]*?queryClient.invalidateQueries\(\{ queryKey: \["admin", "profiles"\] \}\),\s*\}\);/;
const upsertMutationPattern =
  /const upsert = useMutation\(\{[\s\S]*?queryClient.invalidateQueries\(\{ queryKey: \["admin", "profiles"\] \}\),\s*\}\);/;
const deleteMutationPattern =
  /const deleteUser = useMutation\(\{[\s\S]*?queryClient.invalidateQueries\(\{ queryKey: \["admin", "profiles"\] \}\),\s*\}\);/;

content = content.replace(firstBlockPattern, usersQueryReplace);
content = content.replace(upsertMutationPattern, "");
content = content.replace(deleteMutationPattern, "");

fs.writeFileSync("src/routes/admin/users.tsx.new", content);
