export const createUserValidationSchema = {
  // displayName: {
  // 	isLength: {
  // 		options: {
  // 			min: 5,
  // 			max: 32,
  // 		},
  // 		errorMessage:
  // 			"displayName must be at least 5 characters with a max of 32 characters",
  // 	},
  // 	notEmpty: {
  // 		errorMessage: "displayName cannot be empty",
  // 	},
  // 	isString: {
  // 		errorMessage: "displayName must be a string!",
  // 	},
  // },
  // displayName: {
  // 	notEmpty: true,
  // },
  password: {
    notEmpty: true,
  },
};
