export function defineMvuDataStore<T extends z.ZodObject>(
  schema: T,
  variable_option: VariableOption,
  additional_setup?: (data: Ref<z.infer<T>>) => void,
): ReturnType<typeof defineStore> {
  if (
    variable_option.type === 'message' &&
    (variable_option.message_id === undefined || variable_option.message_id === 'latest')
  ) {
    variable_option.message_id = -1;
  }

  return defineStore(
    `mvu_data.${_(variable_option)
      .entries()
      .sortBy(entry => entry[0])
      .map(entry => entry[1])
      .join('.')}`,
    errorCatched(() => {
      const data = ref(schema.parse(_.get(getVariables(variable_option), 'stat_data', {}))) as Ref<z.infer<T>>;
      if (additional_setup) {
        additional_setup(data);
      }

      useIntervalFn(() => {
        const stat_data = _.get(getVariables(variable_option), 'stat_data', {});
        const result = schema.safeParse(stat_data);
        if (result.error) {
          return;
        }
        if (!_.isEqual(data.value, result.data)) {
          ignoreUpdates(() => {
            data.value = result.data;
          });
        }
        if (!_.isEqual(stat_data, result.data)) {
          updateVariablesWith(variables => _.set(variables, 'stat_data', result.data), variable_option);
        }
      }, 2000);

      const { ignoreUpdates } = watchIgnorable(
        data,
        new_data => {
          const result = schema.safeParse(new_data);
          if (result.error) {
            return;
          }
          if (!_.isEqual(new_data, result.data)) {
            ignoreUpdates(() => {
              data.value = result.data;
            });
          }
          updateVariablesWith(variables => _.set(variables, 'stat_data', result.data), variable_option);
        },
        { deep: true },
      );

      return { data };
    }),
  );
}
