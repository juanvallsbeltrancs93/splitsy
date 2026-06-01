from typing import Annotated

from fastapi import APIRouter, Depends, Response

from src.domain.expenses.entities.expense import ExpenseData, SplitData
from src.domain.expenses.use_cases.create_expense_use_case import CreateExpenseUseCase
from src.domain.expenses.use_cases.delete_expense_use_case import DeleteExpenseUseCase
from src.domain.expenses.use_cases.get_expense_use_case import GetExpenseUseCase
from src.domain.expenses.use_cases.list_group_expenses_use_case import (
    ListGroupExpensesUseCase,
)
from src.domain.expenses.use_cases.update_expense_use_case import UpdateExpenseUseCase
from src.domain.users.entities.user import User
from src.presentation.rest_api.dependencies import (
    get_create_expense_use_case,
    get_current_user,
    get_delete_expense_use_case,
    get_get_expense_use_case,
    get_list_group_expenses_use_case,
    get_update_expense_use_case,
)
from src.presentation.rest_api.dto.expense_dto import (
    ExpenseCreateDTO,
    ExpenseResponseDTO,
    ExpenseUpdateDTO,
)

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.post(
    "/group/{group_id}",
    response_model=ExpenseResponseDTO,
    status_code=201,
    summary="Create expense",
    description="Add a new expense to a group. The splits must cover the full expense amount.",
)
async def create_expense(
    group_id: str,
    body: ExpenseCreateDTO,
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[CreateExpenseUseCase, Depends(get_create_expense_use_case)],
) -> ExpenseResponseDTO:
    expense = await use_case(
        ExpenseData(
            name=body.name,
            amount=body.amount,
            date=body.date,
            group_id=group_id,
            paid_by=body.paid_by,
            splits=[
                SplitData(participant_id=s.participant_id, amount=s.amount)
                for s in body.splits
            ],
            description=body.description,
        )
    )
    return ExpenseResponseDTO.from_entity(expense)


@router.get(
    "/group/{group_id}",
    response_model=list[ExpenseResponseDTO],
    summary="List group expenses",
    description="Return all expenses recorded for a given group.",
)
async def list_group_expenses(
    group_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[
        ListGroupExpensesUseCase, Depends(get_list_group_expenses_use_case)
    ],
) -> list[ExpenseResponseDTO]:
    expenses = await use_case(group_id)
    return [ExpenseResponseDTO.from_entity(e) for e in expenses]


@router.get(
    "/{expense_id}",
    response_model=ExpenseResponseDTO,
    summary="Get expense",
    description="Return the details of a single expense by its ID.",
)
async def get_expense(
    expense_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[GetExpenseUseCase, Depends(get_get_expense_use_case)],
) -> ExpenseResponseDTO:
    expense = await use_case(expense_id)
    return ExpenseResponseDTO.from_entity(expense)


@router.patch(
    "/{expense_id}",
    response_model=ExpenseResponseDTO,
    summary="Update expense",
    description=(
        "Update an existing expense. "
        "Only provided fields are updated; omitted fields retain their current values."
    ),
)
async def update_expense(
    expense_id: str,
    body: ExpenseUpdateDTO,
    current_user: Annotated[User, Depends(get_current_user)],
    get_use_case: Annotated[GetExpenseUseCase, Depends(get_get_expense_use_case)],
    update_use_case: Annotated[
        UpdateExpenseUseCase, Depends(get_update_expense_use_case)
    ],
) -> ExpenseResponseDTO:
    existing = await get_use_case(expense_id)
    expense = await update_use_case(expense_id, body.merge_with(existing))
    return ExpenseResponseDTO.from_entity(expense)


@router.delete(
    "/{expense_id}",
    status_code=204,
    summary="Delete expense",
    description="Permanently delete an expense by its ID.",
)
async def delete_expense(
    expense_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[DeleteExpenseUseCase, Depends(get_delete_expense_use_case)],
) -> Response:
    await use_case(expense_id)
    return Response(status_code=204)
